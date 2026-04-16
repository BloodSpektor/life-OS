import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export function Statistics() {
  // Mock data
  const weightData = [
    { date: "01.03", weight: 75.5 },
    { date: "08.03", weight: 75.2 },
    { date: "15.03", weight: 74.8 },
    { date: "22.03", weight: 74.5 },
    { date: "29.03", weight: 74.2 },
    { date: "05.04", weight: 73.9 },
  ];

  const caloriesData = [
    { date: "Пн", consumed: 1850, burned: 2200, target: 2000 },
    { date: "Вт", consumed: 2100, burned: 2350, target: 2000 },
    { date: "Ср", consumed: 1920, burned: 2100, target: 2000 },
    { date: "Чт", consumed: 2050, burned: 2400, target: 2000 },
    { date: "Пт", consumed: 1780, burned: 2000, target: 2000 },
    { date: "Сб", consumed: 2200, burned: 2500, target: 2000 },
    { date: "Вс", consumed: 1650, burned: 1900, target: 2000 },
  ];

  const healthScoreData = [
    { metric: "Питание", score: 85 },
    { metric: "Сон", score: 75 },
    { metric: "Активность", score: 90 },
    { metric: "Гидратация", score: 70 },
    { metric: "Регулярность", score: 80 },
  ];

  const expensesData = [
    { month: "Янв", amount: 12500 },
    { month: "Фев", amount: 13200 },
    { month: "Мар", amount: 11800 },
    { month: "Апр", amount: 8450 },
  ];

  const achievements = [
    {
      title: "7 дней подряд",
      description: "Отслеживание калорий",
      icon: "🔥",
      achieved: true,
    },
    {
      title: "Цель по воде",
      description: "5 дней подряд",
      icon: "💧",
      achieved: true,
    },
    {
      title: "Потеря 2 кг",
      description: "За месяц",
      icon: "⚖️",
      achieved: true,
    },
    {
      title: "Экономия бюджета",
      description: "Меньше на 20%",
      icon: "💰",
      achieved: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Статистика и прогресс</h1>
        <p className="text-gray-500 mt-1">Анализируйте свои результаты</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Вес</p>
                <div className="text-2xl font-bold">73.9 кг</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">-1.6 кг</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Средние калории</p>
                <div className="text-2xl font-bold">1936</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">-64 ккал</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Дни в режиме</p>
                <div className="text-2xl font-bold">21/30</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">70%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Расходы</p>
                <div className="text-2xl font-bold">8,450 ₽</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">-28%</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Здоровье</TabsTrigger>
          <TabsTrigger value="finance">Финансы</TabsTrigger>
          <TabsTrigger value="achievements">Достижения</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {/* Weight Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Динамика веса</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[73, 76]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorWeight)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calories Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Баланс калорий (неделя)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={caloriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumed" fill="#f59e0b" name="Потреблено" />
                      <Bar dataKey="burned" fill="#22c55e" name="Сожжено" />
                      <Bar dataKey="target" fill="#94a3b8" name="Цель" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Score Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Общая оценка здоровья</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={healthScoreData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Показатель"
                        dataKey="score"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          {/* Monthly Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Расходы по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expensesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
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

          {/* Expense Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Средние расходы</p>
                <div className="text-2xl font-bold">11,488 ₽</div>
                <p className="text-sm text-gray-500 mt-1">в месяц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Экономия</p>
                <div className="text-2xl font-bold text-green-600">3,750 ₽</div>
                <p className="text-sm text-gray-500 mt-1">vs прошлый месяц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Прогноз на месяц</p>
                <div className="text-2xl font-bold">13,200 ₽</div>
                <p className="text-sm text-gray-500 mt-1">на основе трат</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className={achievement.achieved ? "border-green-200 bg-green-50" : ""}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        {achievement.achieved && (
                          <Badge className="bg-green-600">Получено</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Общий прогресс</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Достижения</span>
                    <span className="text-sm text-gray-500">3 из 4</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">21</div>
                    <p className="text-sm text-gray-500">Дней активности</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">-1.6</div>
                    <p className="text-sm text-gray-500">кг потеряно</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">3,750</div>
                    <p className="text-sm text-gray-500">₽ экономия</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
