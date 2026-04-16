# Life OS

Комплексное приложение для управления здоровьем и образом жизни.

## Возможности MVP

- 🍎 **Онлайн холодильник** - управление продуктами и сроками годности
- 💧 **Трекинг воды** - отслеживание потребления жидкости
- 🍽️ **Учет питания** - калории, БЖУ, рецепты
- 💪 **Тренировки** - журнал физической активности

## Технологический стек

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: NestJS, TypeScript
- **Database**: SQLite (для MVP), Prisma ORM
- **Monorepo**: npm workspaces

## Структура проекта

```
life-os/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Общие типы и утилиты
│   └── database/     # Prisma схемы
└── services/         # Будущие Go микросервисы
```

## Установка

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
- Онлайн холодильник
- Трекинг воды
- Учет питания
- Журнал тренировок

### Фаза 2
- Аутентификация пользователей
- Уведомления
- Интеграция с внешними API рецептов
- Расширенная аналитика

### Фаза 3
- AI распознавание фото продуктов
- OCR чеков
- Мобильные приложения (iOS, Android)
- Интеграция с фитнес-трекерами

## Лицензия

Private
