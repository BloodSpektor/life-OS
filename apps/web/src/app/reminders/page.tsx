"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2, Apple, Pill, Droplets, Dumbbell, Moon } from "lucide-react";
import { NotificationModal } from "@/components/NotificationModal";

interface Notification {
  id: string;
  userId: string;
  category: string;
  title: string;
  time: string;
  days: string;
  comment: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

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
      return <Bell className="h-5 w-5 text-gray-600" />;
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

export default function RemindersPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | undefined>(undefined);

  // Функция для получения заголовков с токеном
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/notifications", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleCreateNotification = async (data: {
    category: string;
    title: string;
    time: string;
    days: string[];
    comment?: string;
  }) => {
    try {
      console.log("Creating notification:", data);
      const response = await fetch("http://localhost:3002/api/notifications", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Notification created successfully:", result);
        await fetchNotifications();
        setIsModalOpen(false);
      } else {
        const errorData = await response.text();
        console.error("Failed to create notification:", response.status, errorData);
        alert(`Ошибка создания уведомления: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Не удалось создать уведомление. Проверьте, что сервис уведомлений запущен.");
    }
  };

  const handleUpdateNotification = async (data: {
    category: string;
    title: string;
    time: string;
    days: string[];
    comment?: string;
  }) => {
    if (!editingNotification) return;

    try {
      console.log("Updating notification:", editingNotification.id, data);
      const response = await fetch(
        `http://localhost:3002/api/notifications/${editingNotification.id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        console.log("Notification updated successfully");
        await fetchNotifications();
        setIsModalOpen(false);
        setEditingNotification(undefined);
      } else {
        const errorData = await response.text();
        console.error("Failed to update notification:", response.status, errorData);
        alert(`Ошибка обновления уведомления: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating notification:", error);
      alert("Не удалось обновить уведомление. Проверьте, что сервис уведомлений запущен.");
    }
  };

  const handleToggleEnabled = async (notification: Notification) => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/notifications/${notification.id}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ isEnabled: !notification.isEnabled }),
        }
      );

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error toggling notification:", error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3002/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const openEditModal = (notification: Notification) => {
    const days = JSON.parse(notification.days);
    setEditingNotification({
      ...notification,
      days: days,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingNotification(undefined);
    setIsModalOpen(true);
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.category]) {
      acc[notification.category] = [];
    }
    acc[notification.category].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
          <p className="text-gray-500 mt-1">Управляйте своими напоминаниями</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateModal} data-create-notification>
          <Plus className="mr-2 h-4 w-4" />
          Создать напоминание
        </Button>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-24 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Список уведомлений пуст</p>
                <p className="text-sm text-gray-500 mt-1">Создайте первое напоминание</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedNotifications).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-sm font-medium capitalize">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((notification) => {
                  const days = JSON.parse(notification.days);
                  return (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onDoubleClick={() => openEditModal(notification)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${getCategoryColor(notification.category)}`}>
                          {getCategoryIcon(notification.category)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{notification.time}</span>
                            <span>•</span>
                            <span>{days.join(", ")}</span>
                          </div>
                          {notification.comment && (
                            <p className="text-sm text-gray-500 mt-1">{notification.comment}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={notification.isEnabled}
                          onCheckedChange={() => handleToggleEnabled(notification)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <NotificationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={editingNotification ? handleUpdateNotification : handleCreateNotification}
        initialData={
          editingNotification
            ? {
                id: editingNotification.id,
                category: editingNotification.category,
                title: editingNotification.title,
                time: editingNotification.time,
                days: editingNotification.days as any,
                comment: editingNotification.comment,
              }
            : undefined
        }
      />
    </div>
  );
}
