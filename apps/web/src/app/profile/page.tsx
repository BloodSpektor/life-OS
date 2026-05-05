"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/user-store";
import { UserProfile, SubscriptionStatus } from "@/types/user";
import { User, Mail, Phone, Calendar, LogOut, Edit, Crown, CheckCircle, XCircle } from "lucide-react";

// Simple toast implementation since sonner might not be installed
const toast = {
  success: (message: string) => {
    console.log(`✓ ${message}`);
    alert(message);
  },
  error: (message: string) => {
    console.error(`✗ ${message}`);
    alert(message);
  },
};

const API_BASE_URL = "http://localhost:3001";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, subscription, isLoading, error, setUser, setSubscription, setLoading, setError, clearUser } = useUserStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize user from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    // Initialize from localStorage
    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setEditForm({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
      });
    } catch (e) {
      console.error("Failed to parse user data:", e);
    }

    // Fetch fresh data from API
    fetchUserProfile();
    fetchSubscription();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data: UserProfile = await response.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Continue with localStorage data
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/subscription`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }

      const data: SubscriptionStatus = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      // Set default free subscription
      setSubscription({
        plan: "free",
        status: "active",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }

      const updatedUser: UserProfile = await response.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Профиль успешно обновлен");
      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error("Ошибка при обновлении профиля");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Call logout endpoint to invalidate session on server
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      clearUser();
      toast.success("Вы вышли из аккаунта");
      router.push("/auth/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case "premium":
        return "default";
      case "trial":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "premium":
        return "Premium";
      case "trial":
        return "Пробный";
      default:
        return "Бесплатный";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Профиль</h1>
          <p className="text-gray-500 mt-1">Управление вашим аккаунтом</p>
        </div>
        <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выход из аккаунта</DialogTitle>
              <DialogDescription>
                Вы уверены, что хотите выйти из аккаунта?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Выйти
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
          <CardDescription>Ваши данные и настройки аккаунта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="text-lg">{getInitials(user?.name || "")}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактировать профиль</DialogTitle>
                  <DialogDescription>
                    Внесите изменения в свой профиль
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Введите ваше имя"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Введите ваш email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Отмена
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Сохранение..." : "Сохранить"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* User Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Имя</p>
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            {user?.createdAt && (
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Дата регистрации</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              По��писка
            </CardTitle>
            <CardDescription>Информация о вашей подписке</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={getPlanBadgeVariant(subscription.plan)}>
                  {getPlanLabel(subscription.plan)}
                </Badge>
                <div className="flex items-center gap-2">
                  {getStatusIcon(subscription.status)}
                  <span className="text-sm text-gray-600">
                    {subscription.status === "active" ? "Активна" : "Неактивна"}
                  </span>
                </div>
              </div>
              {subscription.plan !== "premium" && (
                <Button className="gap-2">
                  <Crown className="h-4 w-4" />
                  Купить Premium
                </Button>
              )}
            </div>

            {subscription.plan === "premium" && (
              <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  У вас активна Premium подписка
                </p>
                {subscription.endsAt && (
                  <p className="text-sm text-gray-600">
                    Действует до: {formatDate(subscription.endsAt)}
                  </p>
                )}
              </div>
            )}

            {subscription.plan === "trial" && subscription.endsAt && (
              <Alert>
                <AlertDescription>
                  Пробный период истекает {formatDate(subscription.endsAt)}
                </AlertDescription>
              </Alert>
            )}

            {subscription.plan === "free" && (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-gray-600">
                  Обновитесь до Premium, чтобы получить доступ ко всем функциям
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}