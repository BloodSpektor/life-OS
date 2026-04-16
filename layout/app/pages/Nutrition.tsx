import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Plus, Camera, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function Nutrition() {
  const [activeTab, setActiveTab] = useState("today");

  // Mock data
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
  };

  const consumed = {
    calories: 1650,
    protein: 98,
    carbs: 185,
    fats: 52,
  };

  const weeklyData = [
    { day: "Пн", calories: 1850 },
    { day: "Вт", calories: 2100 },
    { day: "Ср", calories: 1920 },
    { day: "Чт", calories: 2050 },
    { day: "Пт", calories: 1780 },
    { day: "Сб", calories: 2200 },
    { day: "Вс", calories: 1650 },
  ];

  const macroData = [
    { name: "Белки", value: consumed.protein, color: "#ef4444" },
    { name: "Углеводы", value: consumed.carbs, color: "#3b82f6" },
    { name: "Жиры", value: consumed.fats, color: "#f59e0b" },
  ];

  const meals = [
    {
      id: 1,
      name: "Завтрак",
      time: "08:30",
      items: ["Овсянка с фруктами", "Яйца", "Кофе"],
      calories: 420,
      protein: 18,
      carbs: 55,
      fats: 12,
    },
    {
      id: 2,
      name: "Перекус",
      time: "11:00",
      items: ["Греческий йогурт", "Орехи"],
      calories: 250,
      protein: 15,
      carbs: 20,
      fats: 12,
    },
    {
      id: 3,
      name: "Обед",
      time: "13:30",
      items: ["Куриная грудка", "Рис", "Овощной салат"],
      calories: 580,
      protein: 45,
      carbs: 60,
      fats: 15,
    },
    {
      id: 4,
      name: "Ужин",
      time: "19:00",
      items: ["Лосось", "Киноа", "Брокколи"],
      calories: 400,
      protein: 20,
      carbs: 50,
      fats: 13,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Питание и калории</h1>
          <p className="text-gray-500 mt-1">Отслеживайте свой рацион</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Добавить еду
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" />
            Сканировать
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="today">Сегодня</TabsTrigger>
          <TabsTrigger value="week">Неделя</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Daily Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Калории</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumed.calories} / {dailyGoals.calories}
                </div>
                <p className="text-xs text-gray-500 mt-1">ккал</p>
                <Progress
                  value={(consumed.calories / dailyGoals.calories) * 100}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Белки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumed.protein} / {dailyGoals.protein}
                </div>
                <p className="text-xs text-gray-500 mt-1">г</p>
                <Progress
                  value={(consumed.protein / dailyGoals.protein) * 100}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Углеводы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumed.carbs} / {dailyGoals.carbs}
                </div>
                <p className="text-xs text-gray-500 mt-1">г</p>
                <Progress
                  value={(consumed.carbs / dailyGoals.carbs) * 100}
                  className="mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Жиры</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consumed.fats} / {dailyGoals.fats}
                </div>
                <p className="text-xs text-gray-500 mt-1">г</p>
                <Progress
                  value={(consumed.fats / dailyGoals.fats) * 100}
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Macros Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение макронутриентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Приемы пищи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{meal.name}</h3>
                          <p className="text-sm text-gray-500">{meal.time}</p>
                        </div>
                        <Badge>{meal.calories} ккал</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {meal.items.map((item, idx) => (
                          <p key={idx}>• {item}</p>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>Б: {meal.protein}г</span>
                        <span>У: {meal.carbs}г</span>
                        <span>Ж: {meal.fats}г</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Калории за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">1936</div>
                    <p className="text-sm text-gray-500">Средние калории</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">13,550</div>
                <p className="text-sm text-gray-500">Всего калорий</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">5/7</div>
                <p className="text-sm text-gray-500">Дней в пределах нормы</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
