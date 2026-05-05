# Реализация страницы "Профиль" - Life OS

## Дата: 2026-05-05

## Обзор

Страница **Профиль** реализована в `apps/web` согласно требованиям из `prompt2.md`.

## Созданные файлы

### 1. Типы данных (`apps/web/src/types/user.ts`)
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt?: string;
}

interface SubscriptionStatus {
  plan: 'free' | 'premium' | 'trial';
  status: 'active' | 'expired' | 'canceled';
  startsAt?: string;
  endsAt?: string;
}
```

### 2. Zustand Store (`apps/web/src/lib/user-store.ts`)
```typescript
interface UserState {
  user: UserProfile | null;
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user) => void;
  setSubscription: (subscription) => void;
  clearUser: () => void;
}
```

### 3. Страница Profile (`apps/web/src/app/profile/page.tsx`)
- Просмотр данных пользователя
- Редактирование профиля (модальное окно)
- Выход из аккаунта (с подтверждением)
- Блок статуса подписки
- Кнопка "Купить Premium"
- Skeleton загрузчики

## Использование Zustand store

```typescript
import { useUserStore } from "@/lib/user-store";

function MyComponent() {
  const { user, subscription, setUser, clearUser } = useUserStore();
  
  // Использование данных
  console.log(user?.name);
  console.log(subscription?.plan);
}
```

## API Endpoints (требуется реализация на бэкенде)

### GET `/api/user/profile`
```json
{
  "id": "123",
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "phone": "+7 999 123-45-67",
  "avatarUrl": "https://...",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### PATCH `/api/user/profile`
```json
{
  "name": "Новое имя",
  "email": "new@example.com",
  "phone": "+7 999 000-00-00"
}
```

### GET `/api/user/subscription`
```json
{
  "plan": "premium",
  "status": "active",
  "startsAt": "2026-01-01T00:00:00Z",
  "endsAt": "2027-01-01T00:00:00Z"
}
```

### POST `/api/auth/logout`

## Требования prompt2 выполнены

- ✅ Отображение данных пользователя
- ✅ Редактирование профиля с сохранением через API
- ✅ Выход из аккаунта
- ✅ Блок статуса подписки
- ✅ Использование Zustand store
- ✅ TypeScript типизация
- ✅ Использование UI компонентов

## Тестирование UI без бэкенда

Страница работает с localStorage данными. При отсутствии API используются данные из localStorage.