import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Trash2, Calendar, AlertCircle } from "lucide-react";
import { api } from "../../src/lib/api";

interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  category: string;
  calories: number | null;
}

export function Fridge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "г",
    category: "Овощи",
    calories: "",
    expiryDate: "",
  });

  const fetchItems = async () => {
    try {
      const res = await api.get("/api/inventory");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.quantity) return;

    try {
      const res = await api.post("/api/inventory", {
        name: newItem.name,
        quantity: parseFloat(newItem.quantity),
        unit: newItem.unit,
        category: newItem.category,
        calories: newItem.calories ? parseFloat(newItem.calories) : undefined,
        expiryDate: newItem.expiryDate || undefined,
      });

      if (res.ok) {
        setNewItem({ name: "", quantity: "", unit: "г", category: "Овощи", calories: "", expiryDate: "" });
        setShowAddForm(false);
        fetchItems();
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/inventory/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysUntilExpiry = (expiry: string | null) => {
    if (!expiry) return null;
    const today = new Date("2026-05-04");
    const expiryDate = new Date(expiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadgeVariant = (days: number | null) => {
    if (days === null) return "secondary";
    if (days < 0) return "destructive";
    if (days <= 2) return "destructive";
    if (days <= 5) return "default";
    return "secondary";
  };

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  if (loading) {
    return <div className="text-center py-12">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мой холодильник</h1>
          <p className="text-gray-500 mt-1">Управляйте запасами продуктов</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Добавить продукт
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новый продукт</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Название"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
              <Input
                placeholder="Количество"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="г">г</option>
                <option value="кг">кг</option>
                <option value="мл">мл</option>
                <option value="л">л</option>
                <option value="шт">шт</option>
              </select>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="Овощи">Овощи</option>
                <option value="Фрукты">Фрукты</option>
                <option value="Молочные">Молочные</option>
                <option value="Мясо">Мясо</option>
                <option value="Бакалея">Бакалея</option>
              </select>
              <Input
                placeholder="Калории (необязательно)"
                type="number"
                value={newItem.calories}
                onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
              />
              <Input
                placeholder="Срок годности"
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
              />
              <div className="col-span-2 flex gap-2">
                <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {items.filter((item) => {
                const days = getDaysUntilExpiry(item.expiryDate);
                return days !== null && days <= 5 && days >= 0;
              }).length}
            </div>
            <p className="text-sm text-gray-500">Скоро истекает срок</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {items.reduce((sum, item) => sum + (item.calories || 0), 0).toLocaleString()}
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
                  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{item.name}</h3>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 5 && (
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
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                          {item.calories && <span>{item.calories} ккал</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {daysUntilExpiry !== null && (
                          <Badge variant={getExpiryBadgeVariant(daysUntilExpiry)}>
                            {daysUntilExpiry < 0
                              ? "Просрочено"
                              : daysUntilExpiry === 0
                              ? "Сегодня"
                              : `${daysUntilExpiry} дн.`}
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

      {filteredItems.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Продукты не найдены
          </CardContent>
        </Card>
      )}
    </div>
  );
}
