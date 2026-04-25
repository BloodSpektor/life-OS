"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Calendar, AlertCircle, Pencil, ShoppingBasket } from "lucide-react";
import { FoodItemModal } from "@/components/FoodItemModal";
import { AddToMealModal } from "@/components/AddToMealModal";

interface FoodItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    category: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface Stats {
    totalItems: number;
    expiringItems: number;
    totalCalories: number;
}

export default function FridgePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<FoodItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [stats, setStats] = useState<Stats>({ totalItems: 0, expiringItems: 0, totalCalories: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | undefined>(undefined);
    const [addToMealItem, setAddToMealItem] = useState<FoodItem | undefined>(undefined);
    const [isAddToMealOpen, setIsAddToMealOpen] = useState(false);

    // Функция для получения заголовков с токеном
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    };

    useEffect(() => {
        fetchItems();
        fetchCategories();
        fetchStats();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/inventory", {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/inventory/categories", {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/inventory/stats", {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleCreateItem = async (data: {
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiryDate?: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }) => {
        try {
            const response = await fetch("http://localhost:3001/api/inventory", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await fetchItems();
                await fetchCategories();
                await fetchStats();
                setIsModalOpen(false);
            } else {
                const errorText = await response.text();
                console.error("Create item failed:", response.status, errorText);
                alert(`Ошибка создания: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error("Error creating item:", error);
            alert("Не удалось создать продукт. Проверьте соединение с API.");
        }
    };

    const handleUpdateItem = async (data: {
        name: string;
        category: string;
        quantity: number;
        unit: string;
        expiryDate?: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }) => {
        if (!editingItem) return;

        try {
            const response = await fetch(`http://localhost:3001/api/inventory/${editingItem.id}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (response.ok) {
                await fetchItems();
                await fetchCategories();
                await fetchStats();
                setIsModalOpen(false);
                setEditingItem(undefined);
            } else {
                const errorText = await response.text();
                console.error("Update item failed:", response.status, errorText);
                alert(`Ошибка обновления: ${response.status}`);
            }
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Не удалось обновить продукт.");
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3001/api/inventory/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                await fetchItems();
                await fetchCategories();
                await fetchStats();
            } else {
                const errorText = await response.text();
                console.error("Delete item failed:", response.status, errorText);
                alert(`Ошибка удаления: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Не удалось удалить продукт.");
        }
    };

    const openEditModal = (item: FoodItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const openAddToMeal = (item: FoodItem) => {
        setAddToMealItem(item);
        setIsAddToMealOpen(true);
    };

    const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const getDaysUntilExpiry = (expiryDate: string | null) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getExpiryBadgeVariant = (days: number | null): "default" | "secondary" | "destructive" => {
        if (days === null) return "secondary";
        if (days < 0) return "destructive";
        if (days <= 2) return "destructive";
        if (days <= 5) return "default";
        return "secondary";
    };

    const groupedCategories = Array.from(new Set(items.map((item) => item.category)));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Мой холодильник</h1>
                    <p className="text-gray-500 mt-1">Управляйте запасами продуктов</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить продукт
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Поиск продуктов..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-sm text-gray-500">Всего продуктов</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">{stats.expiringItems}</div>
                        <p className="text-sm text-gray-500">Скоро истекает срок</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{stats.totalCalories.toLocaleString("ru-RU")}</div>
                        <p className="text-sm text-gray-500">Всего калорий</p>
                    </CardContent>
                </Card>
            </div>

            {/* Items by Category */}
            {groupedCategories.map((category) => {
                const categoryItems = filteredItems.filter((item) => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle className="font-bold">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {categoryItems.map((item) => {
                                    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                                    return (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-normal">{item.name}</h3>
                                                    {daysUntilExpiry !== null && daysUntilExpiry <= 5 && daysUntilExpiry >= 0 && (
                                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <span>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                    {item.expiryDate && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.expiryDate).toLocaleDateString("ru-RU")}
                                                        </span>
                                                    )}
                                                    <span>{item.calories} ккал</span>
                                                    <span>Б:{item.protein ?? 0}г</span>
                                                    <span>У:{item.carbs ?? 0}г</span>
                                                    <span>Ж:{item.fats ?? 0}г</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {daysUntilExpiry !== null && (
                                                    <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                                                        {daysUntilExpiry < 0 ? "Просрочено" : daysUntilExpiry === 0 ? "Сегодня" : `${daysUntilExpiry} дн.`}
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openAddToMeal(item)}
                                                    className="hover:bg-green-50 hover:text-green-600 transition-colors"
                                                    title="Добавить в прием пищи"
                                                >
                                                    <ShoppingBasket className="h-4 w-4 text-green-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditModal(item)}
                                                    className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            {filteredItems.length === 0 && items.length > 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">Продукты не найдены</CardContent>
                </Card>
            )}

            {items.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        <p>Холодильник пуст</p>
                        <p className="text-sm mt-1">Добавьте первый продукт</p>
                    </CardContent>
                </Card>
            )}

            <FoodItemModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
                existingCategories={categories}
                initialData={
                    editingItem
                        ? {
                              id: editingItem.id,
                              name: editingItem.name,
                              category: editingItem.category,
                              quantity: editingItem.quantity,
                              unit: editingItem.unit,
                              expiryDate: editingItem.expiryDate || undefined,
                              calories: editingItem.calories,
                              protein: editingItem.protein,
                              carbs: editingItem.carbs,
                              fats: editingItem.fats,
                          }
                        : undefined
                }
            />

            <AddToMealModal
                open={isAddToMealOpen}
                onOpenChange={setIsAddToMealOpen}
                item={addToMealItem ? { id: addToMealItem.id, name: addToMealItem.name, quantity: addToMealItem.quantity, unit: addToMealItem.unit } : undefined}
                onCompleted={() => {
                    fetchItems();
                    fetchStats();
                }}
            />
        </div>
    );
}
