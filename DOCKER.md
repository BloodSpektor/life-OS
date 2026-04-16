# Life OS - Docker Setup

## Быстрый старт

### Запуск всех сервисов

```bash
docker-compose up -d
```

### Остановка всех сервисов

```bash
docker-compose down
```

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f notifications
```

### Пересборка после изменений

```bash
docker-compose up -d --build
```

## Сервисы

- **Web (Next.js)**: http://localhost:3000
- **API (NestJS)**: http://localhost:3001
- **Notifications (Go)**: http://localhost:3002

## Структура

```
life-os/
├── apps/
│   ├── api/              # NestJS API (порт 3001)
│   │   └── Dockerfile
│   └── web/              # Next.js Frontend (порт 3000)
│       └── Dockerfile
├── services/
│   └── notifications-service/  # Go микросервис (порт 3002)
│       └── Dockerfile
└── docker-compose.yml
```

## Переменные окружения

### API (.env)
```
NODE_ENV=production
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Web
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_NOTIFICATIONS_URL=http://localhost:3002
```

## Управление данными

### Очистка volumes

```bash
docker-compose down -v
```

### Backup базы данных

```bash
docker cp life-os-api:/app/apps/api/dev.db ./backup.db
```

### Restore базы данных

```bash
docker cp ./backup.db life-os-api:/app/apps/api/dev.db
```

## Разработка

Для разработки рекомендуется запускать сервисы локально:

```bash
# API
cd apps/api
npm run dev

# Web
cd apps/web
npm run dev

# Notifications
cd services/notifications-service
go run cmd/server/main.go
```

## Troubleshooting

### Порты заняты

Если порты 3000, 3001 или 3002 заняты, измените их в `docker-compose.yml`:

```yaml
ports:
  - "8000:3000"  # Внешний:Внутренний
```

### Проблемы с сетью

```bash
docker network prune
docker-compose up -d
```

### Пересоздание контейнеров

```bash
docker-compose down
docker-compose up -d --force-recreate
```
