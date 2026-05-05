import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  category: string;
  calories: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

export interface MealItem {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  items: MealItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface FoodContextType {
  fridgeItems: FoodItem[];
  setFridgeItems: (items: FoodItem[]) => void;
  meals: Meal[];
  addToMeal: (mealId: string, food: FoodItem, quantity: number) => void;
  removeFromMeal: (mealId: string, itemIndex: number) => void;
  clearMeal: (mealId: string) => void;
  updateFridgeQuantity: (foodId: string, newQuantity: number) => void;
  removeFromFridge: (foodId: string) => void;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [fridgeItems, setFridgeItems] = useState<FoodItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([
    { id: "breakfast", name: "Завтрак", items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
    { id: "lunch", name: "Обед", items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
    { id: "dinner", name: "Ужин", items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
    { id: "snack", name: "Перекус", items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } },
  ]);

  const calculateTotals = (items: MealItem[]) => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fats: acc.fats + item.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const addToMeal = useCallback((mealId: string, food: FoodItem, quantity: number) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;

        const ratio = quantity / (food.quantity || 100);
        const newItem: MealItem = {
          foodId: food.id,
          name: food.name,
          quantity,
          unit: food.unit,
          calories: Math.round((food.calories || 0) * ratio),
          protein: Math.round((food.protein || 0) * ratio),
          carbs: Math.round((food.carbs || 0) * ratio),
          fats: Math.round((food.fats || 0) * ratio),
        };

        const newItems = [...meal.items, newItem];
        return { ...meal, items: newItems, totals: calculateTotals(newItems) };
      })
    );

    // Decrease quantity in fridge
    const newQuantity = food.quantity - quantity;
    if (newQuantity <= 0) {
      removeFromFridge(food.id);
    } else {
      updateFridgeQuantity(food.id, newQuantity);
    }
  }, []);

  const removeFromMeal = useCallback((mealId: string, itemIndex: number) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        const newItems = meal.items.filter((_, idx) => idx !== itemIndex);
        return { ...meal, items: newItems, totals: calculateTotals(newItems) };
      })
    );
  }, []);

  const clearMeal = useCallback((mealId: string) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id !== mealId) return meal;
        // Return items to fridge
        meal.items.forEach((item) => {
          const existing = fridgeItems.find((f) => f.id === item.foodId);
          if (existing) {
            updateFridgeQuantity(item.foodId, existing.quantity + item.quantity);
          }
        });
        return { ...meal, items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
      })
    );
  }, [fridgeItems]);

  const updateFridgeQuantity = useCallback((foodId: string, newQuantity: number) => {
    setFridgeItems((prev) =>
      prev.map((item) => (item.id === foodId ? { ...item, quantity: newQuantity } : item))
    );
  }, []);

  const removeFromFridge = useCallback((foodId: string) => {
    setFridgeItems((prev) => prev.filter((item) => item.id !== foodId));
  }, []);

  return (
    <FoodContext.Provider
      value={{
        fridgeItems,
        setFridgeItems,
        meals,
        addToMeal,
        removeFromMeal,
        clearMeal,
        updateFridgeQuantity,
        removeFromFridge,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
}

export function useFoodContext() {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFoodContext must be used within a FoodProvider");
  }
  return context;
}
