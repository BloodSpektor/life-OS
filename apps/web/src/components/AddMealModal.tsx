"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
    id: string;
    title: string;
    time: string;
    category: string;
}

interface FridgeItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

interface SelectedProduct {
    fridgeItem: FridgeItem;
    amount: number;
    unit: string;
}

interface MealLog {
    id: string;
    name: string;
    time: string;
    date: string;
    items: any[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface AddMealModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCompleted: () => void;
    selectedDate: string;
}

export function AddMealModal({ open, onOpenChange, onCompleted, selectedDate }: AddMealModalProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
    const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);

    const [selectedMealOption, setSelectedMealOption] = useState<string>("new");
    const [newMealName, setNewMealName] = useState("");
    const [newMealTime, setNewMealTime] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
            fetchMealLogs();
            fetchFridgeItems();
            setSelectedMealOption("new");
            setNewMealName("");
            setNewMealTime("");
            setSelectedProducts([]);
            setSearchQuery("");
        }
    }, [open]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:3002/api/notifications", {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                const foodNotifications = data.filter((n: any) => n.category === "прием пищи");
                setNotifications(foodNotifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchMealLogs = async () => {
        try {
            const response = await api.get(`meal-logs?date=${selectedDate}`);
            if (response.ok) {
                const data = await response.json();
                setMealLogs(data);
            }
        } catch (error) {
            console.error("Error fetching meal logs:", error);
        }
    };

    const fetchFridgeItems = async () => {
        setLoading(true);
        try {
            const response = await api.get("inventory");
            if (response.ok) {
                const data = await response.json();
                setFridgeItems(data);
            }
        } catch (error) {
            console.error("Error fetching fridge items:", error);
        } finally {
            setLoading(false);
        }
    };

    // Build options: existing meal logs + notifications without meal log + new
    const getMealOptions = () => {
        const options: Array<{ type: "meal-log" | "notification" | "new"; id: string; label: string; time: string }> = [];

        // Existing meal logs for today
        mealLogs.forEach((ml) => {
            options.push({ type: "meal-log", id: ml.id, label: ml.name, time: ml.time });
        });

        // Notifications that don't have a corresponding meal log
        notifications.forEach((n) => {
            const hasMealLog = mealLogs.some((ml) => ml.name === n.title && ml.time === n.time);
            if (!hasMealLog) {
                options.push({ type: "notification", id: `notif-${n.id}`, label: n.title, time: n.time });
            }
        });

        return options.sort((a, b) => a.time.localeCompare(b.time));
    };

    const mealOptions = getMealOptions();

    const filteredItems = fridgeItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleProduct = (item: FridgeItem) => {
        setSelectedProducts((prev) => {
            const existing = prev.find((p) => p.fridgeItem.id === item.id);
            if (existing) {
                return prev.filter((p) => p.fridgeItem.id !== item.id);
            }
            const canDivide = item.unit === "л" || item.unit === "кг" || item.unit === "мл" || item.unit === "г";
            return [
                ...prev,
                {
                    fridgeItem: item,
                    amount: canDivide ? 0 : 1,
                    unit: item.unit,
                },
            ];
        });
    };

    const updateProductAmount = (itemId: string, amount: number, unit: string) => {
        setSelectedProducts((prev) => prev.map((p) => (p.fridgeItem.id === itemId ? { ...p, amount: Math.max(0, amount), unit } : p)));
    };

    const calculateProductNutrition = (product: SelectedProduct) => {
        const item = product.fridgeItem;
        const ratio = product.amount / 100;
        return {
            calories: Math.round((item.calories || 0) * ratio),
            protein: Math.round((item.protein || 0) * ratio * 10) / 10,
            carbs: Math.round((item.carbs || 0) * ratio * 10) / 10,
            fats: Math.round((item.fats || 0) * ratio * 10) / 10,
        };
    };

    const totals = selectedProducts.reduce(
        (acc, p) => {
            const nut = calculateProductNutrition(p);
            return {
                calories: acc.calories + nut.calories,
                protein: acc.protein + nut.protein,
                carbs: acc.carbs + nut.carbs,
                fats: acc.fats + nut.fats,
            };
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const handleSubmit = async () => {
        const validProducts = selectedProducts.filter((p) => p.amount > 0);
        if (validProducts.length === 0) return;

        setSubmitting(true);

        const mealItems = validProducts.map((p) => ({
            name: p.fridgeItem.name,
            quantity: p.amount,
            unit: p.unit,
            ...calculateProductNutrition(p),
        }));

        try {
            // Consume from fridge
            for (const product of validProducts) {
                try {
                    await api.post(`inventory/${product.fridgeItem.id}/consume`, {
                        amount: product.amount,
                        unit: product.unit,
                    });
                } catch (error) {
                    console.error("Error consuming product:", error);
                }
            }

            if (selectedMealOption === "new") {
                // Create new meal log
                await api.post("meal-logs", {
                    name: newMealName || "Прием пищи",
                    time: newMealTime || new Date().toTimeString().slice(0, 5),
                    date: selectedDate,
                    items: mealItems,
                    ...totals,
                });
            } else if (selectedMealOption.startsWith("notif-")) {
                // Create meal log from notification
                const notifId = selectedMealOption.replace("notif-", "");
                const notif = notifications.find((n) => n.id === notifId);
                await api.post("meal-logs", {
                    name: notif?.title || "Прием пищи",
                    time: notif?.time || new Date().toTimeString().slice(0, 5),
                    date: selectedDate,
                    items: mealItems,
                    ...totals,
                });
            } else {
                // Add to existing meal log
                const mealLog = mealLogs.find((ml) => ml.id === selectedMealOption);
                if (mealLog) {
                    const existingItems = Array.isArray(mealLog.items) ? mealLog.items : [];
                    const allItems = [...existingItems, ...mealItems];
                    const newTotals = allItems.reduce(
                        (acc: any, item: any) => ({
                            calories: acc.calories + (item.calories || 0),
                            protein: acc.protein + (item.protein || 0),
                            carbs: acc.carbs + (item.carbs || 0),
                            fats: acc.fats + (item.fats || 0),
                        }),
                        { calories: 0, protein: 0, carbs: 0, fats: 0 },
                    );
                    await api.patch(`meal-logs/${mealLog.id}`, {
                        items: allItems,
                        ...newTotals,
                    });
                }
            }

            onOpenChange(false);
            onCompleted();
        } catch (error) {
            console.error("Error adding meal:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const selectedOption = mealOptions.find((o) => o.id === selectedMealOption);
    const isNewMeal = selectedMealOption === "new" || selectedMealOption.startsWith("notif-");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Добавить прием пищи</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {/* Step 1: Select Meal */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">1. Выберите прием пищи</Label>
                        <Select value={selectedMealOption} onValueChange={setSelectedMealOption}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите прием пищи" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new">
                                    <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Новый прием
                                    </div>
                                </SelectItem>
                                {mealOptions.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                        {opt.label} — {opt.time}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {isNewMeal && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Название</Label>
                                    <Input placeholder="Завтрак, Обед..." value={newMealName} onChange={(e) => setNewMealName(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Время</Label>
                                    <Input type="time" value={newMealTime} onChange={(e) => setNewMealTime(e.target.value)} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Select Products from Fridge */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">2. Выберите продукты из холодильника</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Поиск продуктов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Загрузка...</div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">Продукты не найдены</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredItems.map((item) => {
                                    const selected = selectedProducts.find((p) => p.fridgeItem.id === item.id);
                                    const canDivide = item.unit === "л" || item.unit === "кг" || item.unit === "мл" || item.unit === "г";

                                    return (
                                        <div
                                            key={item.id}
                                            className={`border rounded-lg p-3 transition-colors ${selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{item.name}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                        <span>
                                                            В наличии: {item.quantity} {item.unit}
                                                        </span>
                                                        <span>
                                                            {item.calories} ккал/100{item.unit === "шт" ? "шт" : item.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant={selected ? "default" : "outline"} size="sm" onClick={() => toggleProduct(item)}>
                                                    {selected ? "Выбрано" : "Выбрать"}
                                                </Button>
                                            </div>

                                            {selected && canDivide && (
                                                <div className="mt-3 pt-3 border-t border-green-200">
                                                    <Label className="text-sm">Количество:</Label>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            max={item.quantity}
                                                            value={selected.amount || ""}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                updateProductAmount(item.id, val, selected.unit);
                                                            }}
                                                            placeholder="0"
                                                            className="w-32"
                                                        />
                                                        <span className="text-sm text-gray-500">{selected.unit}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Максимум: {item.quantity} {item.unit}
                                                    </p>
                                                </div>
                                            )}

                                            {selected && !canDivide && (
                                                <div className="mt-3 pt-3 border-t border-green-200">
                                                    <p className="text-sm text-gray-600">Будет добавлено: 1 {item.unit}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    {selectedProducts.length > 0 && (
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

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || selectedProducts.filter((p) => p.amount > 0).length === 0 || (isNewMeal && !newMealName)}>
                        {submitting ? "Сохранение..." : "Добавить прием пищи"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
