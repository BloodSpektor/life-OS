import { create } from "zustand";

export interface MealItem {
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
    time: string;
    date: string;
    items: MealItem[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface DailyStats {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fats: { consumed: number; target: number };
}

interface NutritionState {
    meals: Meal[];
    dailyStats: DailyStats;
    selectedDate: string;
    isLoading: boolean;
    error: string | null;

    // Actions
    setMeals: (meals: Meal[]) => void;
    addMeal: (meal: Meal) => void;
    updateMeal: (id: string, meal: Partial<Meal>) => void;
    removeMeal: (id: string) => void;
    clearMealItems: (id: string) => void;
    setDailyStats: (stats: DailyStats) => void;
    setSelectedDate: (date: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    calculateDailyStats: (meals?: Meal[]) => void;
}

const DEFAULT_STATS: DailyStats = {
    calories: { consumed: 0, target: 2000 },
    protein: { consumed: 0, target: 150 },
    carbs: { consumed: 0, target: 250 },
    fats: { consumed: 0, target: 70 },
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
    meals: [],
    dailyStats: DEFAULT_STATS,
    selectedDate: new Date().toISOString().split("T")[0],
    isLoading: false,
    error: null,

    setMeals: (meals) => {
        set({ meals });
        get().calculateDailyStats(meals);
    },

    addMeal: (meal) => {
        const newMeals = [...get().meals, meal];
        set({ meals: newMeals });
        get().calculateDailyStats(newMeals);
    },

    updateMeal: (id, updates) => {
        const newMeals = get().meals.map((m) => (m.id === id ? { ...m, ...updates } : m));
        set({ meals: newMeals });
        get().calculateDailyStats(newMeals);
    },

    removeMeal: (id) => {
        const newMeals = get().meals.filter((m) => m.id !== id);
        set({ meals: newMeals });
        get().calculateDailyStats(newMeals);
    },

    clearMealItems: (id) => {
        const newMeals = get().meals.map((m) => (m.id === id ? { ...m, items: [], calories: 0, protein: 0, carbs: 0, fats: 0 } : m));
        set({ meals: newMeals });
        get().calculateDailyStats(newMeals);
    },

    setDailyStats: (stats) => set({ dailyStats: stats }),

    setSelectedDate: (date) => set({ selectedDate: date }),

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    calculateDailyStats: (meals) => {
        const targetMeals = meals || get().meals;
        const totals = targetMeals.reduce(
            (acc, meal) => ({
                calories: acc.calories + (meal.calories || 0),
                protein: acc.protein + (meal.protein || 0),
                carbs: acc.carbs + (meal.carbs || 0),
                fats: acc.fats + (meal.fats || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 },
        );

        set((state) => ({
            dailyStats: {
                calories: { ...state.dailyStats.calories, consumed: Math.round(totals.calories) },
                protein: { ...state.dailyStats.protein, consumed: Math.round(totals.protein) },
                carbs: { ...state.dailyStats.carbs, consumed: Math.round(totals.carbs) },
                fats: { ...state.dailyStats.fats, consumed: Math.round(totals.fats) },
            },
        }));
    },
}));
