# Notifications Service

Golang микросервис для управления уведомлениями Life OS.

## Запуск

### Windows
```bash
start.bat
```

### Linux/Mac
```bash
go run cmd/server/main.go
```

## API Endpoints

- `GET /api/notifications` - Получить все уведомления
- `GET /api/notifications/active` - Получить активные уведомления
- `GET /api/notifications/:id` - Получить уведомление по ID
- `POST /api/notifications` - Создать уведомление
- `PATCH /api/notifications/:id` - Обновить уведомление
- `DELETE /api/notifications/:id` - Удалить уведомление

## Порт

Сервис работает на порту **3002**

## Важно

Перед использованием приложения убедитесь, что сервис уведомлений запущен. Без него создание и отображение уведомлений работать не будет.
