"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Apple, Droplets, Moon, Activity, Plus, Pencil, Trash2, Pill, Dumbbell, Wheat } from "lucide-react";
import { MealPlanModal } from "@/components/MealPlanModal";
import { useNutritionStore } from "@/lib/nutrition-store";
import { api } from "@/lib/api";

interface Notification {
    id: string;
    category: string;
    title: string;
    time: string;
    days: string;
    comment?: string;
    isEnabled: boolean;
}

export function HomePage() {
    const router = useRouter();
    const userName = null;
    const isAuthenticated = !!userName;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | undefined>(undefined);

    const nutritionStore = useNutritionStore();

    const dailyStats = {
        calories: nutritionStore.dailyStats.calories,
        water: { consumed: 0, target: 8 },
        sleep: { hours: 0, target: 8 },
        steps: { count: 0, target: 10000 },
    };

    const fetchMeals = useCallback(async () => {
        const today = new Date().toISOString().split("T")[0];
        try {
            const response = await api.get(`meal-logs?date=${today}`);
            if (response.ok) {
                const data = await response.json();
                const parsedMeals = data.map((m: any) => ({
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
                nutritionStore.setMeals(parsedMeals);
            }
        } catch (error) {
            console.error("Error fetching meals for home:", error);
        }
    }, []);

    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);

    // Функция для получения заголовков с токеном
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        };
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("http://localhost:3002/api/notifications/active", {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();

                // Сортируем уведомления по времени (ближайшие первыми)
                const now = new Date();
                const currentTime = now.getHours() * 60 + now.getMinutes();

                const sortedNotifications = data.sort((a: Notification, b: Notification) => {
                    const [aHours, aMinutes] = a.time.split(":").map(Number);
                    const [bHours, bMinutes] = b.time.split(":").map(Number);

                    const aTime = aHours * 60 + aMinutes;
                    const bTime = bHours * 60 + bMinutes;

                    // Вычисляем разницу до текущего времени
                    const aDiff = aTime >= currentTime ? aTime - currentTime : 24 * 60 - currentTime + aTime;
                    const bDiff = bTime >= currentTime ? bTime - currentTime : 24 * 60 - currentTime + bTime;

                    return aDiff - bDiff;
                });

                setNotifications(sortedNotifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleCreateMeal = async (data: { name: string; scheduledTime: string; plannedCalories: number; days: string[] }) => {
        try {
            // Создаем уведомление для приема пищи
            const response = await fetch("http://localhost:3002/api/notifications", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    category: "прием пищи",
                    title: data.name,
                    time: data.scheduledTime,
                    days: data.days,
                    comment: `Планируемые калории: ${data.plannedCalories} ккал`,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error("Failed to create notification:", response.status, errorData);
            } else {
                console.log("Notification created successfully");
                await fetchNotifications();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Error creating notification for meal:", error);
        }
    };

    const handleUpdateMeal = async (data: { name: string; scheduledTime: string; plannedCalories: number; days: string[] }) => {
        if (!editingNotification) return;

        try {
            const response = await fetch(`http://localhost:3002/api/notifications/${editingNotification.id}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: data.name,
                    time: data.scheduledTime,
                    days: data.days,
                    comment: `Планируемые калории: ${data.plannedCalories} ккал`,
                }),
            });

            if (response.ok) {
                await fetchNotifications();
                setIsModalOpen(false);
                setEditingNotification(undefined);
            }
        } catch (error) {
            console.error("Error updating meal plan:", error);
        }
    };

    const handleDeleteMeal = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3002/api/notifications/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                await fetchNotifications();
            }
        } catch (error) {
            console.error("Error deleting meal plan:", error);
        }
    };

    const openEditModal = (notification: Notification) => {
        setEditingNotification(notification);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingNotification(undefined);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isAuthenticated ? `Добро пожаловать, ${userName}!` : "Добро пожаловать!"}</h1>
                    <p className="text-gray-500 mt-1">Вот ваша статистика за сегодня</p>
                </div>
            </div>

            {/* Daily Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Calories */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push("/nutrition")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Калории</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dailyStats.calories.consumed} / {dailyStats.calories.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">ккал</p>
                        <Progress value={(dailyStats.calories.consumed / dailyStats.calories.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                {/* Water */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Вода</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dailyStats.water.consumed} / {dailyStats.water.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">стаканов</p>
                        <Progress value={(dailyStats.water.consumed / dailyStats.water.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                {/* Sleep */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Сон</CardTitle>
                        <Moon className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dailyStats.sleep.hours} / {dailyStats.sleep.target}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">часов</p>
                        <Progress value={(dailyStats.sleep.hours / dailyStats.sleep.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>

                {/* Steps */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Шаги</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dailyStats.steps.count.toLocaleString("ru-RU")}</div>
                        <p className="text-xs text-gray-500 mt-1">из {dailyStats.steps.target.toLocaleString("ru-RU")}</p>
                        <Progress value={(dailyStats.steps.count / dailyStats.steps.target) * 100} className="mt-3" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Meal Plans - from notifications category "прием пищи" */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Приемы пищи</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => router.push("/nutrition")}>
                                <Plus className="h-4 w-4 mr-1" />
                                Управление
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {notifications.filter((n) => n.category === "прием пищи").length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Нет запланированных приемов пищи</p>
                                <p className="text-sm mt-1">Добавьте первый прием пищи</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications
                                    .filter((n) => n.category === "прием пищи")
                                    .sort((a, b) => {
                                        const [aHours, aMinutes] = a.time.split(":").map(Number);
                                        const [bHours, bMinutes] = b.time.split(":").map(Number);
                                        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                                    })
                                    .map((notification) => (
                                        <div
                                            key={notification.id}
                                            className="flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                                            onClick={() => router.push("/nutrition")}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Apple className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{notification.title}</p>
                                                    <p className="text-xs text-gray-500 capitalize">прием пищи</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {notification.time}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(notification);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMeal(notification.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Reminders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Напоминания</CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.push("/reminders");
                                    // Небольшая задержка для открытия модального окна после перехода
                                    setTimeout(() => {
                                        const createButton = document.querySelector("[data-create-notification]") as HTMLButtonElement;
                                        if (createButton) createButton.click();
                                    }, 100);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Создать
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Нет активных напоминаний</p>
                                <p className="text-sm mt-1">Создайте первое напоминание</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(() => {
                                    // Группируем уведомления по категориям и берем первое (ближайшее) из каждой
                                    const categoriesMap = new Map<string, Notification>();

                                    notifications.forEach((notification) => {
                                        if (!categoriesMap.has(notification.category)) {
                                            categoriesMap.set(notification.category, notification);
                                        }
                                    });

                                    // Преобразуем в массив и сортируем по времени
                                    const uniqueNotifications = Array.from(categoriesMap.values());

                                    const getCategoryIcon = (category: string) => {
                                        switch (category) {
                                            case "прием пищи":
                                                return <Apple className="h-5 w-5 text-green-600" />;
                                            case "лекарства":
                                                return <Pill className="h-5 w-5 text-blue-600" />;
                                            case "вода":
                                                return <Droplets className="h-5 w-5 text-cyan-600" />;
                                            case "тренировка":
                                                return <Dumbbell className="h-5 w-5 text-orange-600" />;
                                            case "сон":
                                                return <Moon className="h-5 w-5 text-indigo-600" />;
                                            default:
                                                return <Activity className="h-5 w-5 text-gray-600" />;
                                        }
                                    };

                                    const getCategoryColor = (category: string) => {
                                        switch (category) {
                                            case "прием пищи":
                                                return "bg-green-100";
                                            case "лекарства":
                                                return "bg-blue-100";
                                            case "вода":
                                                return "bg-cyan-100";
                                            case "тренировка":
                                                return "bg-orange-100";
                                            case "сон":
                                                return "bg-indigo-100";
                                            default:
                                                return "bg-gray-100";
                                        }
                                    };

                                    return uniqueNotifications.map((notification) => (
                                        <div key={notification.id} className="flex items-center justify-between border rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getCategoryColor(notification.category)}`}>{getCategoryIcon(notification.category)}</div>
                                                <div>
                                                    <p className="font-medium text-sm">{notification.title}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{notification.category}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {notification.time}
                                            </Badge>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium">Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => router.push("/nutrition")}>
                            <Apple className="h-6 w-6" />
                            <span>Добавить еду</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Droplets className="h-6 w-6" />
                            <span>Выпил воды</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Activity className="h-6 w-6" />
                            <span>Тренировка</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <TrendingUp className="h-6 w-6" />
                            <span>Прогресс</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <MealPlanModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={editingNotification ? handleUpdateMeal : handleCreateMeal}
                initialData={
                    editingNotification
                        ? {
                              id: editingNotification.id,
                              name: editingNotification.title,
                              scheduledTime: editingNotification.time,
                              plannedCalories: parseInt(editingNotification.comment?.match(/\d+/)?.[0] || "0"),
                              days: JSON.parse(editingNotification.days || "[]"),
                          }
                        : undefined
                }
            />
        </div>
    );
}
