import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Flame, TrendingUp, Apple, Droplets, Moon, Activity, Camera, Plus,
} from "lucide-react";
import { useFoodContext } from "../store/foodContext";

export function Home() {
  const { meals } = useFoodContext();

  const dailyStats = {
    calories: { consumed: Math.round(meals.reduce((sum, m) => sum + m.totals.calories, 0)), target: 2000 },
    water: { consumed: 6, target: 8 },
    sleep: { hours: 7.5, target: 8 },
    steps: { count: 8450, target: 10000 },
  };

  const recentMeals = meals.map((meal) => ({
    name: meal.name,
    time: meal.id === "breakfast" ? "08:30" : meal.id === "lunch" ? "13:30" : meal.id === "dinner" ? "19:00" : "11:00",
    calories: Math.round(meal.totals.calories),
  }));

  const upcomingReminders = [
    { type: "meal", text: "Прием пищи", time: "20:00" },
    { type: "medicine", text: "Витамины", time: "21:00" },
    { type: "sleep", text: "Время сна", time: "23:00" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Добро пожаловать!</h1>
          <p className="text-gray-500 mt-1">Вот ваша статистика за сегодня</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Camera className="mr-2 h-4 w-4" />
          Добавить через фото (Premium)
        </Button>
      </div>

      {/* Daily Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Калории", icon: Flame, color: "orange", value: dailyStats.calories.consumed, target: dailyStats.calories.target, unit: "ккал" },
          { label: "Вода", icon: Droplets, color: "blue", value: dailyStats.water.consumed, target: dailyStats.water.target, unit: "стаканов" },
          { label: "Сон", icon: Moon, color: "indigo", value: dailyStats.sleep.hours, target: dailyStats.sleep.target, unit: "часов" },
          { label: "Шаги", icon: Activity, color: "green", value: dailyStats.steps.count, target: dailyStats.steps.target, unit: "шагов" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()} / {stat.target.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.unit}</p>
              <Progress value={(stat.value / stat.target) * 100} className="mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Приемы пищи сегодня</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMeals.map((meal, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Apple className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-sm text-gray-500">{meal.time}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{meal.calories} ккал</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Напоминания</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Создать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReminders.map((reminder, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        reminder.type === "meal"
                          ? "bg-orange-100"
                          : reminder.type === "medicine"
                          ? "bg-blue-100"
                          : "bg-indigo-100"
                      }`}
                    >
                      {reminder.type === "meal" && <Apple className="h-5 w-5 text-orange-600" />}
                      {reminder.type === "medicine" && <Activity className="h-5 w-5 text-blue-600" />}
                      {reminder.type === "sleep" && <Moon className="h-5 w-5 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{reminder.text}</p>
                      <p className="text-sm text-gray-500">{reminder.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{reminder.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
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
    </div>
  );
}
