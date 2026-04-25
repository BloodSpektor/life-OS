"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface Notification {
    id: string;
    title: string;
    comment: string;
    category: string;
    time: string;
}

class NotificationsManager {
    private ws: WebSocket | null = null;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isConnected = false;

    constructor() {
        if (typeof window !== "undefined") {
            this.connect();
        }
    }

    connect() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setTimeout(() => this.connect(), 5000);
                return;
            }

            // Подключаемся напрямую к notifications-service
            const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            // Используем порт 3002 или текущий хост если порт нестандартный
            const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
            const host = isLocalhost ? "localhost:3002" : window.location.host;
            const wsUrl = `${wsProtocol}//${host}/api/ws`;

            console.log("🔌 Connecting to notifications service:", wsUrl);

            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = () => {
                console.log("✅ Подключено к сервису уведомлений");
                this.isConnected = true;

                // Отправляем токен авторизации
                this.ws?.send(
                    JSON.stringify({
                        type: "auth",
                        token: token,
                    }),
                );
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (e) {
                    console.error("❌ Ошибка парсинга сообщения", e);
                }
            };

            this.ws.onclose = () => {
                console.log("🔌 Соединение разорвано, переподключение через 5 секунд");
                this.isConnected = false;
                this.reconnectTimer = setTimeout(() => this.connect(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error("❌ Ошибка WebSocket", error);
            };
        } catch (e) {
            console.error("❌ Ошибка подключения к WebSocket", e);
            this.reconnectTimer = setTimeout(() => this.connect(), 10000);
        }
    }

    handleMessage(message: any) {
        console.log("📩 Получено сообщение", message);

        switch (message.type) {
            case "connected":
                console.log("✅ Авторизация на сервере уведомлений прошла успешно");
                break;

            case "notification":
                this.showNotification(message.data);
                break;
        }
    }

    showNotification(notification: Notification) {
        console.log("🔔 Уведомление:", notification.title);

        // Всплывающий тост справа снизу
        toast.success(notification.title, {
            description: notification.comment,
            duration: 10000,
            position: "bottom-right",
            action: {
                label: "Открыть",
                onClick: () => {
                    window.location.href = "/reminders";
                },
            },
        });

        // Браузерное нативное уведомление (работает даже когда вкладка в фоне)
        this.sendBrowserNotification(notification);
    }

    sendBrowserNotification(notification: Notification) {
        if (!("Notification" in window)) {
            return;
        }

        if (Notification.permission === "granted") {
            const browserNotification = new Notification(notification.title, {
                body: notification.comment,
                icon: "/favicon.ico",
                tag: notification.id,
            });

            browserNotification.onclick = () => {
                window.focus();
                window.location.href = "/reminders";
                browserNotification.close();
            };
        }
    }

    requestPermission() {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}

const notificationManager = typeof window !== "undefined" ? new NotificationsManager() : null;

export function useNotifications() {
    useEffect(() => {
        notificationManager?.requestPermission();

        return () => {
            // Не отключаемся при размонтировании, менеджер живет глобально
        };
    }, []);

    return notificationManager;
}

export default notificationManager;
