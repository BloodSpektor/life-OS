import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Trash2, Calendar, AlertCircle } from "lucide-react";

interface FridgeItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiry: string;
  category: string;
  calories: number;
}

export function Fridge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items] = useState<FridgeItem[]>([
    {
      id: 1,
      name: "Молоко",
      quantity: 1,
      unit: "л",
      expiry: "2026-04-12",
      category: "Молочные",
      calories: 640,
    },
    {
      id: 2,
      name: "Яйца",
      quantity: 10,
      unit: "шт",
      expiry: "2026-04-15",
      category: "Молочные",
      calories: 780,
    },
    {
      id: 3,
      name: "Куриная грудка",
      quantity: 500,
      unit: "г",
      expiry: "2026-04-10",
      category: "Мясо",
      calories: 550,
    },
    {
      id: 4,
      name: "Помидоры",
      quantity: 5,
      unit: "шт",
      expiry: "2026-04-11",
      category: "Овощи",
      calories: 90,
    },
    {
      id: 5,
      name: "Огурцы",
      quantity: 3,
      unit: "шт",
      expiry: "2026-04-13",
      category: "Овощи",
      calories: 45,
    },
    {
      id: 6,
      name: "Сыр",
      quantity: 300,
      unit: "г",
      expiry: "2026-04-20",
      category: "Молочные",
      calories: 1140,
    },
  ]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysUntilExpiry = (expiry: string) => {
    const today = new Date("2026-04-08");
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeVariant = (days: number) => {
    if (days < 0) return "destructive";
    if (days <= 2) return "destructive";
    if (days <= 5) return "default";
    return "secondary";
  };

  const categories = Array.from(new Set(items.map((item) => item.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мой холодильник</h1>
          <p className="text-gray-500 mt-1">Управляйте запасами продуктов</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Поиск продуктов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-sm text-gray-500">Всего продуктов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {items.filter((item) => getDaysUntilExpiry(item.expiry) <= 5).length}
            </div>
            <p className="text-sm text-gray-500">Скоро истекает срок</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {items.reduce((sum, item) => sum + item.calories, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Всего калорий</p>
          </CardContent>
        </Card>
      </div>

      {/* Items by Category */}
      {categories.map((category) => {
        const categoryItems = filteredItems.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryItems.map((item) => {
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiry);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{item.name}</h3>
                          {daysUntilExpiry <= 5 && (
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.expiry}
                          </span>
                          <span>{item.calories} ккал</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                          {daysUntilExpiry < 0
                            ? "Просрочено"
                            : daysUntilExpiry === 0
                            ? "Сегодня"
                            : `${daysUntilExpiry} дн.`}
                        </Badge>
                        <Button variant="ghost" size="icon">
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

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Продукты не найдены
          </CardContent>
        </Card>
      )}
    </div>
  );
}
