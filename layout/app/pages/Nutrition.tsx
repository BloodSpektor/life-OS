import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useFoodContext } from "../store/foodContext";

export function Nutrition() {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const { meals, fridgeItems, addToMeal, removeFromMeal, clearMeal } = useFoodContext();

  const dailyGoals = { calories: 2000, protein: 150, carbs: 250, fats: 65 };

  const totalConsumed = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totals.calories,
      protein: acc.protein + meal.totals.protein,
      carbs: acc.carbs + meal.totals.carbs,
      fats: acc.fats + meal.totals.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const weeklyData = [
    { day: "Пн", calories: 1850 },
    { day: "Вт", calories: 2100 },
    { day: "Ср", calories: 1920 },
    { day: "Чт", calories: 2050 },
    { day: "Пт", calories: 1780 },
    { day: "Сб", calories: 2200 },
    { day: "Вс", calories: totalConsumed.calories || 1650 },
  ];

  const macroData = [
    { name: "Белки", value: totalConsumed.protein, color: "#ef4444" },
    { name: "Углеводы", value: totalConsumed.carbs, color: "#3b82f6" },
    { name: "Жиры", value: totalConsumed.fats, color: "#f59e0b" },
  ];

  const handleAddFromFridge = (mealId: string, foodItem: any) => {
    const quantity = foodItem.quantity > 100 ? 100 : foodItem.quantity;
    addToMeal(mealId, foodItem, quantity);
  };

  const handleClearMeal = (mealId: string) => {
    clearMeal(mealId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Питание и калории</h1>
          <p className="text-gray-500 mt-1">Отслеживайте свой рацион</p>
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
            {[
              { label: "Калории", consumed: totalConsumed.calories, goal: dailyGoals.calories, unit: "ккал" },
              { label: "Белки", consumed: totalConsumed.protein, goal: dailyGoals.protein, unit: "г" },
              { label: "Углеводы", consumed: totalConsumed.carbs, goal: dailyGoals.carbs, unit: "г" },
              { label: "Жиры", consumed: totalConsumed.fats, goal: dailyGoals.fats, unit: "г" },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(item.consumed)} / {item.goal}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{item.unit}</p>
                  <Progress value={(item.consumed / item.goal) * 100} className="mt-3" />
                </CardContent>
              </Card>
            ))}
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                          <Badge className="mt-1">{Math.round(meal.totals.calories)} ккал</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedMeal(meal.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Добавить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearMeal(meal.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Очистить
                          </Button>
                        </div>
                      </div>
                      {meal.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm text-gray-600 py-1">
                          <span>• {item.name} ({item.quantity} {item.unit})</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeFromMeal(meal.id, idx)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>Б: {Math.round(meal.totals.protein)}г</span>
                        <span>У: {Math.round(meal.totals.carbs)}г</span>
                        <span>Ж: {Math.round(meal.totals.fats)}г</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fridge items to add */}
          {selectedMeal && (
            <Card>
              <CardHeader>
                <CardTitle>Добавить из холодильника в {meals.find(m => m.id === selectedMeal)?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fridgeItems.length === 0 && (
                    <p className="text-gray-500 text-sm">Холодильник пуст</p>
                  )}
                  {fridgeItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddFromFridge(selectedMeal, item)}
                        disabled={item.quantity <= 0}
                      >
                        Добавить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{Math.round(totalConsumed.calories) || 1936}</div>
                <p className="text-sm text-gray-500">Средние калории</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{Math.round(totalConsumed.calories * 7) || 13550}</div>
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
