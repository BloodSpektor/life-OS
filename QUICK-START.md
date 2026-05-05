# Быстрые команды для разработки Life OS

## 🚀 Запуск

```powershell
# Обычный запуск
npm run dev

# Запуск с очисткой кеша (если были проблемы)
npm run dev:clean --workspace=apps/web
```

## 🧹 Очистка кеша

```powershell
# Быстрая очистка
.\clean-cache.ps1

# Или через npm
npm run clean --workspace=apps/web
```

## 🐛 Если что-то сломалось

### Ошибка "Cannot find module './XXX.js'"
```powershell
# 1. Остановить сервер (Ctrl+C)
# 2. Очистить кеш
.\clean-cache.ps1
# 3. Перезапустить
npm run dev
```

### Пропала стилизация
```powershell
# В браузере: Ctrl + Shift + R (жесткая перезагрузка)
# Или очистить кеш (см. выше)
```

### Полная переустановка (крайний случай)
```powershell
Remove-Item -Recurse -Force node_modules, apps\web\.next, package-lock.json
npm install
npm run dev
```

## 📦 Docker

```powershell
# Запуск
.\docker.ps1 up

# Остановка
.\docker.ps1 down

# Пересборка без кеша
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## 🗄️ База данных

```powershell
# Применить изменения схемы
npm run db:push

# Открыть Prisma Studio
npm run db:studio

# Сгенерировать Prisma Client
npm run db:generate
```

## 📝 Полезные ссылки

- [Полная документация](./README.md)
- [Решение проблем](./TROUBLESHOOTING.md)
- [Docker инструкции](./DOCKER.md)
- [Задачи по питанию](./prompt.md)
