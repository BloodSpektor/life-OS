# Life OS Docker Management Script

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Доступные команды:" -ForegroundColor Green
    Write-Host "  .\docker.ps1 build     - Собрать все Docker образы"
    Write-Host "  .\docker.ps1 up        - Запустить все сервисы (production)"
    Write-Host "  .\docker.ps1 down      - Остановить все сервисы"
    Write-Host "  .\docker.ps1 logs      - Показать логи всех сервисов"
    Write-Host "  .\docker.ps1 restart   - Перезапустить все сервисы"
    Write-Host "  .\docker.ps1 clean     - Удалить все контейнеры и volumes"
    Write-Host "  .\docker.ps1 dev       - Запустить в режиме разработки"
    Write-Host "  .\docker.ps1 prod      - Запустить в production режиме"
}

switch ($Command) {
    "build" {
        Write-Host "Сборка Docker образов..." -ForegroundColor Yellow
        docker-compose build
    }
    "up" {
        Write-Host "Запуск сервисов (production)..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "Сервисы запущены!" -ForegroundColor Green
        Write-Host "Web: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
        Write-Host "Notifications: http://localhost:3002" -ForegroundColor Cyan
    }
    "down" {
        Write-Host "Остановка сервисов..." -ForegroundColor Yellow
        docker-compose down
    }
    "logs" {
        docker-compose logs -f
    }
    "restart" {
        Write-Host "Перезапуск сервисов..." -ForegroundColor Yellow
        docker-compose restart
    }
    "clean" {
        Write-Host "Очистка контейнеров и volumes..." -ForegroundColor Yellow
        docker-compose down -v
        docker system prune -f
        Write-Host "Очистка завершена!" -ForegroundColor Green
    }
    "dev" {
        Write-Host "Запуск в режиме разработки..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml up -d
        Write-Host "Сервисы запущены в режиме разработки!" -ForegroundColor Green
    }
    "prod" {
        Write-Host "Запуск в production режиме..." -ForegroundColor Yellow
        docker-compose up -d --build
        Write-Host "Сервисы запущены в production!" -ForegroundColor Green
    }
    default {
        Show-Help
    }
}
