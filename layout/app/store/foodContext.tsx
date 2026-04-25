"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FoodItem, FridgeItem, Meal, MealItem, AppState, Reminder } from "../types/food";

interface FoodContextType extends AppState {
    isLoaded: boolean;
}

const FoodContext = createContext<FoodContextType | undefined>(undefined);

const STORAGE_KEY = "life-os-food-data";

// Helper functions
const calculateMealTotals = (meal: Meal, fridge: FridgeItem[]): Meal["totals"] => {
    let calories = 0;
    let protein = 0;
    let fat = 0;
    let carbs = 0;

    meal.items.forEach((item) => {
        const fridgeItem = fridge.find((f) => f.id.toString() === item.foodId);
        if (fridgeItem) {
            const totalCalories = (fridgeItem.caloriesPer100g * item.quantity) / 100;
            const totalProtein = (fridgeItem.proteinPer100g * item.quantity) / 100;
            const totalFat = (fridgeItem.fatPer100g * item.quantity) / 100;
            const totalCarbs = (fridgeItem.carbsPer100g * item.quantity) / 100;

            calories += totalCalories;
            protein += totalProtein;
            fat += totalFat;
            carbs += totalCarbs;
        }
    });

    return {
        calories: Math.round(calories),
        protein: Math.round(protein),
        fat: Math.round(fat),
        carbs: Math.round(carbs),
    };
};

const getDailyTotals = (
    meals: Meal[],
    fridge: FridgeItem[],
): {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
} => {
    let calories = 0;
    let protein = 0;
    let fat = 0;
    let carbs = 0;

    meals.forEach((meal) => {
        const totals = calculateMealTotals(meal, fridge);
        calories += totals.calories;
        protein += totals.protein;
        fat += totals.fat;
        carbs += totals.carbs;
    });

    return {
        calories: Math.round(calories),
        protein: Math.round(protein),
        fat: Math.round(fat),
        carbs: Math.round(carbs),
    };
};

export function FoodProvider({ children }: { children: ReactNode }) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [fridge, setFridge] = useState<FridgeItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setMeals(parsed.meals || []);
                setFridge(parsed.fridge || []);
            }
        } catch (error) {
            console.error("Failed to load food data:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ meals, fridge }));
        }
    }, [meals, fridge, isLoaded]);

    // Meal methods
    const addMeal = (meal: Omit<Meal, "id" | "totals" | "name">) => {
        const newMeal: Meal = {
            name: "Новый приём пищи",
            ...meal,
            id: Date.now().toString(),
            totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
        };
        setMeals((prev) => [...prev, newMeal]);
    };

    const removeMeal = (mealId: string) => {
        setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
    };

    const addToMeal = (mealId: string, foodId: string, quantity: number) => {
        setMeals((prev) =>
            prev.map((meal) => {
                if (meal.id === mealId) {
                    const existingItem = meal.items.find((item) => item.foodId === foodId);
                    const newItems = existingItem
                        ? meal.items.map((item) => (item.foodId === foodId ? { ...item, quantity: item.quantity + quantity } : item))
                        : [...meal.items, { foodId, quantity }];
                    return {
                        ...meal,
                        items: newItems,
                        totals: calculateMealTotals({ ...meal, items: newItems }, fridge),
                    };
                }
                return meal;
            }),
        );
    };

    const removeFromMeal = (mealId: string, foodId: string) => {
        setMeals((prev) =>
            prev.map((meal) => {
                if (meal.id === mealId) {
                    const newItems = meal.items.filter((item) => item.foodId !== foodId);
                    return {
                        ...meal,
                        items: newItems,
                        totals: calculateMealTotals({ ...meal, items: newItems }, fridge),
                    };
                }
                return meal;
            }),
        );
    };

    const clearMeal = (mealId: string) => {
        setMeals((prev) =>
            prev.map((meal) => {
                if (meal.id === mealId) {
                    return {
                        ...meal,
                        items: [],
                        totals: { calories: 0, protein: 0, fat: 0, carbs: 0 },
                    };
                }
                return meal;
            }),
        );
    };

    // Fridge methods
    const addFridgeItem = (item: Omit<FridgeItem, "id">) => {
        const newFridgeItem: FridgeItem = {
            ...item,
            id: Date.now(),
        };
        setFridge((prev) => [...prev, newFridgeItem]);
    };

    const removeFridgeItem = (itemId: number) => {
        setFridge((prev) => prev.filter((item) => item.id !== itemId));
    };

    const updateFridgeQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFridgeItem(itemId);
            return;
        }
        setFridge((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
    };

    // Get meal totals
    const getMealTotals = (meal: Meal): Meal["totals"] => {
        return calculateMealTotals(meal, fridge);
    };

    // Get daily totals
    const getDailyTotals = (): {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } => {
        return getDailyTotals(meals, fridge);
    };

    const value: FoodContextType = {
        meals,
        fridge,
        isLoaded,
        addMeal,
        removeMeal,
        addToMeal,
        removeFromMeal,
        clearMeal,
        addFridgeItem,
        removeFridgeItem,
        updateFridgeQuantity,
        getMealTotals,
        getDailyTotals,
    };

    return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFood() {
    const context = useContext(FoodContext);
    if (context === undefined) {
        throw new Error("useFood must be used within a FoodProvider");
    }
    return context;
}
