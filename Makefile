.PHONY: help build up down logs restart clean dev prod

help: ## Показать помощь
	@echo "Доступные команды:"
	@echo "  make build     - Собрать все Docker образы"
	@echo "  make up        - Запустить все сервисы (production)"
	@echo "  make down      - Остановить все сервисы"
	@echo "  make logs      - Показать логи всех сервисов"
	@echo "  make restart   - Перезапустить все сервисы"
	@echo "  make clean     - Удалить все контейнеры и volumes"
	@echo "  make dev       - Запустить в режиме разработки"
	@echo "  make prod      - Запустить в production режиме"

build: ## Собрать Docker образы
	docker-compose build

up: ## Запустить сервисы (production)
	docker-compose up -d

down: ## Остановить сервисы
	docker-compose down

logs: ## Показать логи
	docker-compose logs -f

restart: ## Перезапустить сервисы
	docker-compose restart

clean: ## Очистить все
	docker-compose down -v
	docker system prune -f

dev: ## Запустить в режиме разработки
	docker-compose -f docker-compose.dev.yml up -d

prod: ## Запустить в production
	docker-compose up -d --build

# Команды для отдельных сервисов
api-logs: ## Логи API
	docker-compose logs -f api

web-logs: ## Логи Web
	docker-compose logs -f web

notifications-logs: ## Логи Notifications
	docker-compose logs -f notifications

api-shell: ## Войти в контейнер API
	docker-compose exec api sh

web-shell: ## Войти в контейнер Web
	docker-compose exec web sh

notifications-shell: ## Войти в контейнер Notifications
	docker-compose exec notifications sh
