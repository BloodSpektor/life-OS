// Типы для системы питания

export interface FoodItem {
    id?: string;
    name: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    fatPer100g: number;
    carbsPer100g: number;
}

export interface FridgeItem extends FoodItem {
    id: number;
    quantity: number; // в граммах или штуках
    unit: string;
    expiry: string;
    category: string;
}

export interface MealItem {
    foodId: string;
    quantity: number; // количество выбранного продукта
}

export interface Meal {
    id: string;
    name: string; // название приёма пищи (из уведомлений)
    items: MealItem[];
    totals: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}

export interface Reminder {
    id: number;
    type: "meal" | "medicine" | "sleep" | "workout" | "water";
    title: string;
    time: string;
    days: string[];
    enabled: boolean;
    note?: string;
}

export interface AppState {
    meals: Meal[];
    fridge: FridgeItem[];
    // Методы
    addMeal: (meal: Omit<Meal, "id" | "totals">) => void;
    removeMeal: (mealId: string) => void;
    addToMeal: (mealId: string, foodId: string, quantity: number) => void;
    removeFromMeal: (mealId: string, foodId: string) => void;
    clearMeal: (mealId: string) => void;
    addFridgeItem: (item: Omit<FridgeItem, "id">) => void;
    removeFridgeItem: (itemId: number) => void;
    updateFridgeQuantity: (itemId: number, quantity: number) => void;
    getMealTotals: (meal: Meal) => Meal["totals"];
    getDailyTotals: () => {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
}
