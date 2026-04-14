.PHONY: help up down build seed logs restart clean

# ── Colors ─────────────────────────────────────────────────────
CYAN  = \033[36m
RESET = \033[0m

help: ## Show this help
	@echo ""
	@echo "  $(CYAN)LocalWala — Dev Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}'
	@echo ""

up: ## Start all services (detached)
	cp -n .env.example .env 2>/dev/null || true
	docker compose up -d --build
	@echo ""
	@echo "  ✅ LocalWala is running!"
	@echo "  🌐 App       →  http://localhost"
	@echo "  ⚡ Frontend  →  http://localhost:3000"
	@echo "  🔧 API       →  http://localhost:8000"
	@echo "  📖 API Docs  →  http://localhost:8000/docs"
	@echo ""

down: ## Stop all services
	docker compose down

build: ## Rebuild images without cache
	docker compose build --no-cache

seed: ## Seed the database with sample data
	docker compose exec backend python -m app.seed

logs: ## Tail logs for all services
	docker compose logs -f

logs-backend: ## Tail backend logs only
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs only
	docker compose logs -f frontend

restart: ## Restart all services
	docker compose restart

restart-backend: ## Restart only the backend
	docker compose restart backend

shell-backend: ## Open a shell in the backend container
	docker compose exec backend bash

shell-db: ## Open psql in the database container
	docker compose exec db psql -U localwala -d localwala_db

migrate: ## Run Alembic migrations
	docker compose exec backend alembic upgrade head

makemigrations: ## Auto-generate a new migration (usage: make makemigrations msg="add table")
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

clean: ## Remove containers, volumes, and images
	docker compose down -v --rmi local
	@echo "🧹 Cleaned up!"
