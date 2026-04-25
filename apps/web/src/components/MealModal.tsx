"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface MealModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { name: string; time: string; items: string[]; calories: number; protein: number; carbs: number; fats: number }) => void;
    initialData?: {
        id: string;
        name: string;
        time: string;
        items: string[];
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

export function MealModal({ open, onOpenChange, onSubmit, initialData }: MealModalProps) {
    const [mealName, setMealName] = useState(initialData?.name || "");
    const [mealTime, setMealTime] = useState(initialData?.time || "");
    const [foodItems, setFoodItems] = useState<FoodItem[]>(
        initialData?.items.map((item) => ({
            name: item,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
        })) || [],
    );

    const addFoodItem = () => {
        setFoodItems([...foodItems, { name: "", calories: 0, protein: 0, carbs: 0, fats: 0 }]);
    };

    const removeFoodItem = (index: number) => {
        setFoodItems(foodItems.filter((_, i) => i !== index));
    };

    const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
        const updated = [...foodItems];
        updated[index] = { ...updated[index], [field]: value };
        setFoodItems(updated);
    };

    const calculateTotals = () => {
        return foodItems.reduce(
            (acc, item) => ({
                calories: acc.calories + (item.calories || 0),
                protein: acc.protein + (item.protein || 0),
                carbs: acc.carbs + (item.carbs || 0),
                fats: acc.fats + (item.fats || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 },
        );
    };

    const handleSubmit = () => {
        const totals = calculateTotals();
        onSubmit({
            name: mealName,
            time: mealTime,
            items: foodItems.map((item) => item.name),
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fats: totals.fats,
        });
        onOpenChange(false);
        // Reset form
        setMealName("");
        setMealTime("");
        setFoodItems([]);
    };

    const totals = calculateTotals();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Редактировать прием пищи" : "Добавить прием пищи"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Meal Name and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="mealName">Название приема пищи</Label>
                            <Input id="mealName" placeholder="Завтрак, Обед, Ужин..." value={mealName} onChange={(e) => setMealName(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="mealTime">Время</Label>
                            <Input id="mealTime" type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} />
                        </div>
                    </div>

                    {/* Food Items */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Продукты и блюда</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addFoodItem}>
                                <Plus className="h-4 w-4 mr-1" />
                                Добавить продукт
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {foodItems.map((item, index) => (
                                <div key={index} className="border rounded-lg p-3 space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Название продукта"
                                            value={item.name}
                                            onChange={(e) => updateFoodItem(index, "name", e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFoodItem(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <Label className="text-xs">Калории</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={item.calories || ""}
                                                onChange={(e) => updateFoodItem(index, "calories", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Белки (г)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={item.protein || ""}
                                                onChange={(e) => updateFoodItem(index, "protein", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Углеводы (г)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={item.carbs || ""}
                                                onChange={(e) => updateFoodItem(index, "carbs", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Жиры (г)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={item.fats || ""}
                                                onChange={(e) => updateFoodItem(index, "fats", parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {foodItems.length === 0 && (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">{'Нажмите "Добавить продукт" чтобы начать'}</div>
                            )}
                        </div>
                    </div>

                    {/* Totals */}
                    {foodItems.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Итого:</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Калории:</span>
                                    <div className="font-bold text-lg">{totals.calories}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Белки:</span>
                                    <div className="font-bold text-lg">{totals.protein}г</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Углеводы:</span>
                                    <div className="font-bold text-lg">{totals.carbs}г</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Жиры:</span>
                                    <div className="font-bold text-lg">{totals.fats}г</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={!mealName || !mealTime || foodItems.length === 0}>
                        {initialData ? "Сохранить" : "Добавить"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
