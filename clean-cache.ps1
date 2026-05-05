#!/usr/bin/env pwsh
# Скрипт для очистки кеша Next.js и node_modules

Write-Host "🧹 Очистка кеша Life OS..." -ForegroundColor Cyan

# Очистка .next
if (Test-Path "apps\web\.next") {
    Write-Host "Удаление apps/web/.next..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "apps\web\.next"
    Write-Host "✓ apps/web/.next удален" -ForegroundColor Green
}

# Очистка node_modules (опционально, раскомментируйте если нужно)
# if (Test-Path "node_modules") {
#     Write-Host "Удаление node_modules..." -ForegroundColor Yellow
#     Remove-Item -Recurse -Force "node_modules"
#     Write-Host "✓ node_modules удален" -ForegroundColor Green
# }

# Очистка package-lock
# if (Test-Path "package-lock.json") {
#     Write-Host "Удаление package-lock.json..." -ForegroundColor Yellow
#     Remove-Item -Force "package-lock.json"
#     Write-Host "✓ package-lock.json удален" -ForegroundColor Green
# }

Write-Host ""
Write-Host "✨ Кеш очищен! Теперь запустите: npm run dev" -ForegroundColor Green
