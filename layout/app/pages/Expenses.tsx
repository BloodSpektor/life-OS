import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, TrendingDown, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function Expenses() {
  const [activeTab, setActiveTab] = useState("month");

  // Mock data
  const monthlyBudget = 15000;
  const spent = 8450;

  const transactions = [
    {
      id: 1,
      date: "2026-04-07",
      category: "Продукты",
      description: "Покупка в супермаркете",
      amount: 2350,
    },
    {
      id: 2,
      date: "2026-04-06",
      category: "Рестораны",
      description: "Ужин в кафе",
      amount: 1200,
    },
    {
      id: 3,
      date: "2026-04-05",
      category: "Продукты",
      description: "Фрукты и овощи",
      amount: 850,
    },
    {
      id: 4,
      date: "2026-04-04",
      category: "Витамины",
      description: "Витамин D и Омега-3",
      amount: 1500,
    },
    {
      id: 5,
      date: "2026-04-03",
      category: "Продукты",
      description: "Мясо и молочные",
      amount: 1850,
    },
    {
      id: 6,
      date: "2026-04-02",
      category: "Рестораны",
      description: "Обед с коллегами",
      amount: 700,
    },
  ];

  const categoryData = [
    { name: "Продукты", amount: 5050, color: "#22c55e" },
    { name: "Рестораны", amount: 1900, color: "#f59e0b" },
    { name: "Витамины", amount: 1500, color: "#3b82f6" },
  ];

  const weeklyData = [
    { week: "Нед 1", amount: 3200 },
    { week: "Нед 2", amount: 2800 },
    { week: "Нед 3", amount: 2450 },
    { week: "Нед 4", amount: 0 },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Продукты":
        return "bg-green-100 text-green-700";
      case "Рестораны":
        return "bg-orange-100 text-orange-700";
      case "Витамины":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Финансы и траты</h1>
          <p className="text-gray-500 mt-1">Контролируйте расходы на питание</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Добавить расход
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Бюджет месяца</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {spent.toLocaleString()} / {monthlyBudget.toLocaleString()} ₽
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Осталось: {(monthlyBudget - spent).toLocaleString()} ₽
            </p>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${(spent / monthlyBudget) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Средний день</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(spent / 8).toLocaleString()} ₽
            </div>
            <p className="text-xs text-green-600 mt-1">-12% от прошлого месяца</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Транзакций</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500 mt-1">За текущий месяц</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="month">Месяц</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-6">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы по неделям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Последние транзакции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{transaction.description}</h3>
                        <Badge
                          variant="secondary"
                          className={getCategoryColor(transaction.category)}
                        >
                          {transaction.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
                    </div>
                    <div className="text-lg font-bold">
                      {transaction.amount.toLocaleString()} ₽
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Category Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categoryData.map((category) => (
              <Card key={category.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div className="text-2xl font-bold">
                    {category.amount.toLocaleString()} ₽
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {((category.amount / spent) * 100).toFixed(1)}% от общих расходов
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
