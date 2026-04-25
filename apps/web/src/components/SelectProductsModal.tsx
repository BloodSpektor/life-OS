"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { api } from "@/lib/api";

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

export interface SelectedProduct {
    fridgeItem: FridgeItem;
    amount: number;
    unit: string;
}

interface SelectProductsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (products: SelectedProduct[]) => void;
    mealName: string;
}

export function SelectProductsModal({ open, onOpenChange, onConfirm, mealName }: SelectProductsModalProps) {
    const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchFridgeItems();
            setSelectedProducts([]);
            setSearchQuery("");
        }
    }, [open]);

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

    const handleConfirm = () => {
        const validProducts = selectedProducts.filter((p) => p.amount > 0 && p.unit);
        onConfirm(validProducts);
        onOpenChange(false);
    };

    const getBaseQuantity = (quantity: number, unit: string): number => {
        switch (unit) {
            case "кг":
                return quantity * 1000;
            case "л":
                return quantity * 1000;
            default:
                return quantity;
        }
    };

    const formatQuantity = (quantity: number, unit: string): string => {
        if (unit === "кг" || unit === "л") {
            const base = getBaseQuantity(quantity, unit);
            if (base >= 1000) {
                return `${(base / 1000).toFixed(2)} ${unit === "кг" ? "кг" : "л"}`;
            }
            return `${base} ${unit === "кг" ? "г" : "мл"}`;
        }
        return `${quantity} ${unit}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Выбор продуктов для {mealName}</DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Поиск продуктов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Загрузка...</div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Продукты не найдены</div>
                    ) : (
                        filteredItems.map((item) => {
                            const selected = selectedProducts.find((p) => p.fridgeItem.id === item.id);
                            const canDivide = item.unit === "л" || item.unit === "кг" || item.unit === "мл" || item.unit === "г";

                            return (
                                <div
                                    key={item.id}
                                    className={`border rounded-lg p-4 transition-colors ${selected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span>В наличии: {formatQuantity(item.quantity, item.unit)}</span>
                                                <span>{item.calories} ккал</span>
                                            </div>
                                        </div>
                                        <Button variant={selected ? "default" : "outline"} size="sm" onClick={() => toggleProduct(item)}>
                                            {selected ? "Выбрано" : "Выбрать"}
                                        </Button>
                                    </div>

                                    {selected && canDivide && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <Label className="text-sm">Количество для добавления:</Label>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex-1">
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
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    {(item.unit === "л" || item.unit === "мл") && (
                                                        <>
                                                            <Button
                                                                variant={selected.unit === "мл" ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateProductAmount(item.id, selected.amount, "мл")}
                                                            >
                                                                мл
                                                            </Button>
                                                            <Button
                                                                variant={selected.unit === "л" ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateProductAmount(item.id, selected.amount, "л")}
                                                            >
                                                                л
                                                            </Button>
                                                        </>
                                                    )}
                                                    {(item.unit === "кг" || item.unit === "г") && (
                                                        <>
                                                            <Button
                                                                variant={selected.unit === "г" ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateProductAmount(item.id, selected.amount, "г")}
                                                            >
                                                                г
                                                            </Button>
                                                            <Button
                                                                variant={selected.unit === "кг" ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateProductAmount(item.id, selected.amount, "кг")}
                                                            >
                                                                кг
                                                            </Button>
                                                        </>
                                                    )}
                                                    {item.unit === "шт" && (
                                                        <Button variant="default" size="sm" disabled>
                                                            шт
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Максимум: {formatQuantity(item.quantity, item.unit)}</p>
                                        </div>
                                    )}

                                    {selected && !canDivide && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <p className="text-sm text-gray-600">Этот продукт нельзя делить. Будет добавлен 1 {item.unit}.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedProducts.filter((p) => p.amount > 0).length === 0}>
                        Добавить выбранные продукты
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
