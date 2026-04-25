"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Utensils, Plus, Trash2, Pencil, Flame, Dumbbell, Wheat, Droplets, ShoppingBasket, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";
import { api } from "@/lib/api";
import { useNutritionStore, Meal, MealItem } from "@/lib/nutrition-store";
import { MealModal } from "@/components/MealModal";
import { AddMealModal } from "@/components/AddMealModal";
import { SelectProductsModal, SelectedProduct } from "@/components/SelectProductsModal";

const COLORS = {
    protein: "#22c55e",
    carbs: "#3b82f6",
    fats: "#f59e0b",
};

export default function NutritionPage() {
    const store = useNutritionStore();
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState<Meal | undefined>(undefined);
    const [selectedMealForProducts, setSelectedMealForProducts] = useState<Meal | undefined>(undefined);

    const today = new Date().toISOString().split("T")[0];

    const fetchMeals = useCallback(async () => {
        store.setLoading(true);
        try {
            const response = await api.get(`meal-logs?date=${store.selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                const parsedMeals: Meal[] = data.map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    time: m.time,
                    date: m.date ? new Date(m.date).toISOString().split("T")[0] : today,
                    items: Array.isArray(m.items) ? m.items : [],
                    calories: m.calories || 0,
                    protein: m.protein || 0,
                    carbs: m.carbs || 0,
                    fats: m.fats || 0,
                }));
                store.setMeals(parsedMeals);
            }
        } catch (error) {
            console.error("Error fetching meals:", error);
            store.setError("Не удалось загрузить приемы пищи");
        } finally {
            store.setLoading(false);
        }
    }, [store.selectedDate]);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    const handleCreateMeal = async (data: { name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fats: number }) => {
        try {
            const response = await api.post("meal-logs", {
                ...data,
                date: store.selectedDate,
            });
            if (response.ok) {
                await fetchMeals();
                setIsMealModalOpen(false);
            }
        } catch (error) {
            console.error("Error creating meal:", error);
        }
    };

    const handleUpdateMeal = async (data: { name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fats: number }) => {
        if (!editingMeal) return;
        try {
            const response = await api.patch(`meal-logs/${editingMeal.id}`, {
                ...data,
                date: store.selectedDate,
            });
            if (response.ok) {
                await fetchMeals();
                setIsMealModalOpen(false);
                setEditingMeal(undefined);
            }
        } catch (error) {
            console.error("Error updating meal:", error);
        }
    };

    const handleDeleteMeal = async (id: string) => {
        try {
            const response = await api.delete(`meal-logs/${id}`);
            if (response.ok) {
                await fetchMeals();
            }
        } catch (error) {
            console.error("Error deleting meal:", error);
        }
    };

    const handleClearMeal = async (meal: Meal) => {
        try {
            const response = await api.patch(`meal-logs/${meal.id}`, {
                items: [],
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
            });
            if (response.ok) {
                await fetchMeals();
            }
        } catch (error) {
            console.error("Error clearing meal:", error);
        }
    };

    const handleAddProductsToMeal = (meal: Meal) => {
        setSelectedMealForProducts(meal);
        setIsProductsModalOpen(true);
    };

    const handleProductsSelected = async (products: SelectedProduct[]) => {
        if (!selectedMealForProducts) return;

        const existingItems: MealItem[] = selectedMealForProducts.items || [];
        const newItems: MealItem[] = products.map((p) => ({
            name: p.fridgeItem.name,
            quantity: p.amount,
            unit: p.unit,
            calories: Math.round(((p.fridgeItem.calories || 0) * p.amount) / 100),
            protein: Math.round(((p.fridgeItem.protein || 0) * p.amount) / 100),
            carbs: Math.round(((p.fridgeItem.carbs || 0) * p.amount) / 100),
            fats: Math.round(((p.fridgeItem.fats || 0) * p.amount) / 100),
        }));

        // Consume from fridge
        for (const product of products) {
            try {
                await api.post(`inventory/${product.fridgeItem.id}/consume`, {
                    amount: product.amount,
                    unit: product.unit,
                });
            } catch (error) {
                console.error("Error consuming product:", error);
            }
        }

        const allItems = [...existingItems, ...newItems];
        const totals = allItems.reduce(
            (acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein,
                carbs: acc.carbs + item.carbs,
                fats: acc.fats + item.fats,
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 },
        );

        try {
            const response = await api.patch(`meal-logs/${selectedMealForProducts.id}`, {
                items: allItems,
                calories: totals.calories,
                protein: totals.protein,
                carbs: totals.carbs,
                fats: totals.fats,
            });
            if (response.ok) {
                await fetchMeals();
            }
        } catch (error) {
            console.error("Error updating meal with products:", error);
        }
    };

    const openEditModal = (meal: Meal) => {
        setEditingMeal(meal);
        setIsMealModalOpen(true);
    };

    const openCreateModal = () => {
        setIsAddMealModalOpen(true);
    };

    const changeDate = (days: number) => {
        const current = new Date(store.selectedDate);
        current.setDate(current.getDate() + days);
        store.setSelectedDate(current.toISOString().split("T")[0]);
    };

    const macroData = [
        { name: "Белки", value: store.dailyStats.protein.consumed, color: COLORS.protein },
        { name: "Углеводы", value: store.dailyStats.carbs.consumed, color: COLORS.carbs },
        { name: "Жиры", value: store.dailyStats.fats.consumed, color: COLORS.fats },
    ].filter((d) => d.value > 0);

    const totalMacros = macroData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Питание и калории</h1>
                    <p className="text-gray-500 mt-1">Отслеживайте свой рацион</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить прием
                </Button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">
                    {store.selectedDate === today
                        ? "Сегодня"
                        : new Date(store.selectedDate).toLocaleDateString("ru-RU", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                          })}
                </span>
                <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Daily Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Калории</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {store.dailyStats.calories.consumed} / {store.dailyStats.calories.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">ккал</p>
                        <Progress value={(store.dailyStats.calories.consumed / store.dailyStats.calories.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Белки</CardTitle>
                        <Dumbbell className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {store.dailyStats.protein.consumed} / {store.dailyStats.protein.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">г</p>
                        <Progress value={(store.dailyStats.protein.consumed / store.dailyStats.protein.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Углеводы</CardTitle>
                        <Wheat className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {store.dailyStats.carbs.consumed} / {store.dailyStats.carbs.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">г</p>
                        <Progress value={(store.dailyStats.carbs.consumed / store.dailyStats.carbs.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Жиры</CardTitle>
                        <Droplets className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {store.dailyStats.fats.consumed} / {store.dailyStats.fats.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">г</p>
                        <Progress value={(store.dailyStats.fats.consumed / store.dailyStats.fats.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* BJU Chart */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Соотношение БЖУ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {totalMacros > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {macroData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {macroData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm text-gray-600">
                                                {entry.name}: {entry.value}г
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                <Utensils className="h-12 w-12 mb-2" />
                                <p>Нет данных о БЖУ</p>
                                <p className="text-sm">Добавьте прием пищи</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Meals List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-medium">Приемы пищи</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {store.isLoading ? (
                            <div className="text-center py-12 text-gray-500">Загрузка...</div>
                        ) : store.meals.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Utensils className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>Нет приемов пищи на эту дату</p>
                                <p className="text-sm mt-1">Добавьте первый прием</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {store.meals
                                    .sort((a, b) => a.time.localeCompare(b.time))
                                    .map((meal) => (
                                        <div key={meal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Utensils className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{meal.name}</h3>
                                                        <Badge variant="outline" className="text-xs mt-1">
                                                            {meal.time}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleAddProductsToMeal(meal)}>
                                                        <ShoppingBasket className="h-4 w-4 mr-1" />
                                                        Из холодильника
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(meal)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleClearMeal(meal)}>
                                                        <X className="h-4 w-4 text-orange-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteMeal(meal.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Meal stats */}
                                            <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                                                <div className="bg-orange-50 rounded px-2 py-1">
                                                    <span className="text-gray-500">Ккал:</span> <span className="font-semibold">{meal.calories}</span>
                                                </div>
                                                <div className="bg-green-50 rounded px-2 py-1">
                                                    <span className="text-gray-500">Б:</span> <span className="font-semibold">{meal.protein}г</span>
                                                </div>
                                                <div className="bg-blue-50 rounded px-2 py-1">
                                                    <span className="text-gray-500">У:</span> <span className="font-semibold">{meal.carbs}г</span>
                                                </div>
                                                <div className="bg-amber-50 rounded px-2 py-1">
                                                    <span className="text-gray-500">Ж:</span> <span className="font-semibold">{meal.fats}г</span>
                                                </div>
                                            </div>

                                            {/* Items list */}
                                            {meal.items && meal.items.length > 0 && (
                                                <div className="space-y-1">
                                                    {meal.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded">
                                                            <span>{typeof item === "string" ? item : `${item.name} — ${item.quantity}${item.unit}`}</span>
                                                            {typeof item !== "string" && <span className="text-gray-500">{item.calories} ккал</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <MealModal
                open={isMealModalOpen}
                onOpenChange={setIsMealModalOpen}
                onSubmit={editingMeal ? handleUpdateMeal : handleCreateMeal}
                initialData={
                    editingMeal
                        ? {
                              id: editingMeal.id,
                              name: editingMeal.name,
                              time: editingMeal.time,
                              items: editingMeal.items.map((i) => (typeof i === "string" ? i : i.name)),
                              calories: editingMeal.calories,
                              protein: editingMeal.protein,
                              carbs: editingMeal.carbs,
                              fats: editingMeal.fats,
                          }
                        : undefined
                }
            />

            <AddMealModal open={isAddMealModalOpen} onOpenChange={setIsAddMealModalOpen} onCompleted={fetchMeals} selectedDate={store.selectedDate} />

            <SelectProductsModal
                open={isProductsModalOpen}
                onOpenChange={setIsProductsModalOpen}
                onConfirm={handleProductsSelected}
                mealName={selectedMealForProducts?.name || ""}
            />
        </div>
    );
}
