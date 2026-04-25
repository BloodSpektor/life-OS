# Life OS

Комплексное приложение для управления здоровьем и образом жизни.

## Возможности MVP

- 🍎 **Онлайн холодильник** - управление продуктами и сроками годности
- 💧 **Трекинг воды** - отслеживание потребления жидкости
- 🍽️ **Учет питания** - калории, БЖУ, рецепты
- 💪 **Тренировки** - журнал физической активности
- 🔔 **Уведомления** - напоминания о приеме пищи, воды, тренировках

## Технологический стек

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend API**: NestJS, TypeScript
- **Notifications Service**: Go, Gin, SQLite
- **Database**: SQLite (для MVP), Prisma ORM
- **Monorepo**: npm workspaces
- **Containerization**: Docker, Docker Compose

## Структура проекта

```
life-os/
├── apps/
│   ├── web/          # Next.js frontend (порт 3000)
│   └── api/          # NestJS backend (порт 3001)
├── packages/
│   ├── shared/       # Общие типы и утилиты
│   └── database/     # Prisma схемы
└── services/
    └── notifications-service/  # Go микросервис (порт 3002)
```

## Быстрый старт с Docker 🐳

### Запуск всех сервисов

**Windows (PowerShell):**

```powershell
.\docker.ps1 up
```

**Linux/Mac:**

```bash
make up
# или
docker-compose up -d
```

### Доступ к приложению

- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Notifications**: http://localhost:3002

### Остановка сервисов

**Windows:**

```powershell
.\docker.ps1 down
```

**Linux/Mac:**

```bash
make down
```

Подробнее см. [DOCKER.md](./DOCKER.md)

## Установка (локальная разработка)

```bash
# Установить зависимости
npm install

# Настроить переменные окружения
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Инициализировать базу данных
npm run db:generate
npm run db:push
```

## Разработка

```bash
# Запустить все приложения
npm run dev

# Запустить только API
npm run dev:api

# Запустить только Web
npm run dev:web

# Prisma Studio
npm run db:studio
```

## Сборка

```bash
# Собрать все приложения
npm run build

# Собрать только API
npm run build:api

# Собрать только Web
npm run build:web
```

## Roadmap

### Фаза 1 (MVP) ✅

- Базовая структура проекта
- Онлайн холодильник с изоляцией данных по пользователям
- Трекинг воды
- Учет питания
- Журнал тренировок
- Микросервис уведомлений (Go)
- Docker контейнеризация

### Фаза 2

- Аутентификация пользователей
- Расширенные уведомления
- Интеграция с внешними API рецептов
- Расширенная аналитика

### Фаза 3

- AI распознавание фото продуктов
- OCR чеков
- Мобильные приложения (iOS, Android)
- Интеграция с фитнес-трекерами

## Лицензия

Private
