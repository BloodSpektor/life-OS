import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Plus, Bell, Pill, Moon, Dumbbell, Apple, Clock, Trash2 } from "lucide-react";
import { useFoodContext } from "../store/foodContext";

interface Reminder {
  id: number;
  type: "meal" | "medicine" | "sleep" | "workout" | "water";
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  note?: string;
}

export function Reminders() {
  const { meals } = useFoodContext();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 1,
      type: "meal",
      title: "Завтрак",
      time: "08:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
      note: "Не пропускайте завтрак!",
    },
    {
      id: 2,
      type: "meal",
      title: "Обед",
      time: "13:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт"],
      enabled: true,
    },
    {
      id: 3,
      type: "meal",
      title: "Ужин",
      time: "19:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
    },
    {
      id: 4,
      type: "medicine",
      title: "Витамин D",
      time: "09:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
    },
    {
      id: 5,
      type: "medicine",
      title: "Омега-3",
      time: "21:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
    },
    {
      id: 6,
      type: "water",
      title: "Выпить воды",
      time: "12:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
      note: "Каждые 2 часа",
    },
    {
      id: 7,
      type: "workout",
      title: "Тренировка",
      time: "18:00",
      days: ["Пн", "Ср", "Пт"],
      enabled: true,
    },
    {
      id: 8,
      type: "sleep",
      title: "Время сна",
      time: "23:00",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
      enabled: true,
      note: "Ложитесь спать вовремя",
    },
  ]);

  const toggleReminder = (id: number) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
      )
    );
  };

  const getTypeIcon = (type: Reminder["type"]) => {
    switch (type) {
      case "meal":
        return <Apple className="h-5 w-5 text-orange-600" />;
      case "medicine":
        return <Pill className="h-5 w-5 text-blue-600" />;
      case "sleep":
        return <Moon className="h-5 w-5 text-indigo-600" />;
      case "workout":
        return <Dumbbell className="h-5 w-5 text-red-600" />;
      case "water":
        return <Bell className="h-5 w-5 text-cyan-600" />;
    }
  };

  const getTypeBg = (type: Reminder["type"]) => {
    switch (type) {
      case "meal":
        return "bg-orange-100";
      case "medicine":
        return "bg-blue-100";
      case "sleep":
        return "bg-indigo-100";
      case "workout":
        return "bg-red-100";
      case "water":
        return "bg-cyan-100";
    }
  };

  const getTypeLabel = (type: Reminder["type"]) => {
    switch (type) {
      case "meal":
        return "Прием пищи";
      case "medicine":
        return "Лекарства";
      case "sleep":
        return "Сон";
      case "workout":
        return "Тренировка";
      case "water":
        return "Вода";
    }
  };

  const categories: Reminder["type"][] = ["meal", "medicine", "water", "workout", "sleep"];

  // Get meal totals for display
  const mealTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totals.calories,
      protein: acc.protein + meal.totals.protein,
      carbs: acc.carbs + meal.totals.carbs,
      fats: acc.fats + meal.totals.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Напоминания</h1>
          <p className="text-gray-500 mt-1">Настройте уведомления для режима дня</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Создать напоминание
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {reminders.filter((r) => r.enabled).length}
                </div>
                <p className="text-sm text-gray-500">Активных напоминаний</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reminders.length}</div>
            <p className="text-sm text-gray-500">Всего напоминаний</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(mealTotals.calories)}</div>
                <p className="text-sm text-gray-500">Калорий сегодня</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals Summary from Context */}
      <Card>
        <CardHeader>
          <CardTitle>Приемы пищи сегодня (из контекста)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{meal.name}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-500">
                    <span>Б: {Math.round(meal.totals.protein)}г</span>
                    <span>У: {Math.round(meal.totals.carbs)}г</span>
                    <span>Ж: {Math.round(meal.totals.fats)}г</span>
                  </div>
                </div>
                <Badge>{Math.round(meal.totals.calories)} ккал</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminders by Category */}
      {categories.map((category) => {
        const categoryReminders = reminders.filter((r) => r.type === category);
        if (categoryReminders.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(category)}
                {getTypeLabel(category)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getTypeBg(reminder.type)}`}>
                        {getTypeIcon(reminder.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{reminder.title}</h3>
                          {!reminder.enabled && (
                            <Badge variant="secondary">Отключено</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reminder.time}
                          </span>
                          <span className="text-sm text-gray-500">
                            {reminder.days.join(", ")}
                          </span>
                        </div>
                        {reminder.note && (
                          <p className="text-sm text-gray-600 mt-2">{reminder.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={reminder.enabled}
                        onCheckedChange={() => toggleReminder(reminder.id)}
                      />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Integration Info */}
      <Card className="border-2 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Интеграция с умными часами</h3>
            <p className="text-sm text-gray-500">
              Подключите свои умные часы для автоматического отслеживания активности,
              сна и калорий
            </p>
            <Button variant="outline" className="mt-4">
              Подключить устройство
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
