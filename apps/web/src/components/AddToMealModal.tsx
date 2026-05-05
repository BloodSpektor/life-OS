"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toBaseQuantity, fromBaseToOriginal } from "@/lib/units";
import { inventoryApi, notifyApi } from "@/lib/api";

interface Item {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

interface AddToMealModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    item?: Item;
    onCompleted?: () => void;
}

export function AddToMealModal({ open, onOpenChange, item, onCompleted }: AddToMealModalProps) {
    const [meals, setMeals] = useState<Array<{ id: string; name: string; time: string }>>([]);
    const [selectedMeal, setSelectedMeal] = useState<string>("new");
    const [amount, setAmount] = useState<string>("0");
    const [unit, setUnit] = useState<string>(item?.unit ?? "г");
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchMeals();
            setSelectedMeal("new");
            setAmount("0");
            setUnit(item?.unit ?? "г");
            setErr(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const fetchMeals = async () => {
        const today = new Date().toISOString().split("T")[0];
        try {
            const resp = await notifyApi.get(`meal-logs?date=${today}`);
            if (resp.ok) {
                const data = await resp.json();
                setMeals(data.map((m: any) => ({ id: m.id, name: m.name, time: m.time })));
            }
        } catch (e) {
            console.error("Error fetching meals", e);
        }
    };

    const handleSubmit = async () => {
        if (!item) return;
        const qty = parseFloat(amount);
        if (isNaN(qty) || qty <= 0) {
            setErr("Укажите количество больше 0");
            return;
        }
        // Consume from fridge
        try {
            const res = await inventoryApi.post(`/api/inventory/${item.id}/consume`, { amount: qty, unit });
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                setErr(error?.message ?? "Не удалось списать продукт");
                return;
            }

            // Add to meal if selected meal
            if (selectedMeal && selectedMeal !== "new") {
                const meal = meals.find((m) => m.id === selectedMeal);
                if (meal) {
                    // fetch existing meal
                    const mResp = await notifyApi.get(`meal-logs/${meal.id}`);
                    if (mResp.ok) {
                        const mData = await mResp.json();
                        const items = Array.isArray(mData.items) ? mData.items.slice() : [];
                        items.push(`${item.name} - ${qty}${unit}`);
                        await notifyApi.patch(`meal-logs/${meal.id}`, { items });
                    }
                }
            } else {
                // Create a new meal log (simple approach)
                const newMeal = {
                    name: "Новый прием",
                    time: new Date().toTimeString().slice(0, 5),
                    items: [`${item.name} - ${qty}${unit}`],
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fats: 0,
                };
                await notifyApi.post("meal-logs", newMeal);
            }

            onOpenChange(false);
            onCompleted?.();
        } catch (e) {
            console.error("Error adding to meal", e);
            setErr("Не удалось выполнить операцию. Проверьте соединение с API.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Добавить в прием пищи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Прием пищи</Label>
                            <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите прием" />
                                </SelectTrigger>
                                <SelectContent>
                                    {meals.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name} — {m.time}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="new">Новый прием</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Единицы</Label>
                            <Select value={unit} onValueChange={setUnit}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="г">г</SelectItem>
                                    <SelectItem value="кг">кг</SelectItem>
                                    <SelectItem value="мл">мл</SelectItem>
                                    <SelectItem value="л">л</SelectItem>
                                    <SelectItem value="шт">шт</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Количество</Label>
                            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                        </div>
                        <div>
                            <Label>Продукт</Label>
                            <Input value={item?.name ?? ""} readOnly />
                        </div>
                    </div>
                    {err && <div className="text-sm text-red-500">{err}</div>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleSubmit}>Добавить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
