# Makefile per il progetto Martial Arts Competition Management

# Variabili
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = martial-arts-app

# Comandi per produzione
.PHONY: build up down logs clean rebuild

# Build di tutti i servizi
build:
	docker-compose -f $(COMPOSE_FILE) build

# Avvia tutti i servizi in produzione
up:
	docker-compose -f $(COMPOSE_FILE) up -d

# Ferma tutti i servizi
down:
	docker-compose -f $(COMPOSE_FILE) down

# Mostra i logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Pulisce tutto (containers, volumes, networks)
clean:
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	docker-compose -f $(COMPOSE_DEV_FILE) down -v --remove-orphans
	docker system prune -f

# Rebuild completo
rebuild: clean build up

# Comandi per sviluppo
.PHONY: dev-build dev-up dev-down dev-logs dev-rebuild

# Build per sviluppo
dev-build:
	docker-compose -f $(COMPOSE_DEV_FILE) build

# Avvia in modalità sviluppo
dev-up:
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

# Ferma sviluppo
dev-down:
	docker-compose -f $(COMPOSE_DEV_FILE) down

# Logs sviluppo
dev-logs:
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

# Rebuild sviluppo
dev-rebuild: dev-down dev-build dev-up

# Comandi per il database
.PHONY: db-reset db-seed db-backup

# Reset del database (elimina e ricrea)
db-reset:
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend-dev npm run seed

# Seed del database con dati di esempio
db-seed:
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend-dev npm run seed

# Backup del database
db-backup:
	docker-compose -f $(COMPOSE_FILE) exec postgres pg_dump -U postgres martial_arts_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Comandi di utilità
.PHONY: status ps shell-backend shell-frontend

# Mostra lo stato dei container
status:
	docker-compose -f $(COMPOSE_FILE) ps

# Alias per status
ps: status

# Shell nel container backend
shell-backend:
	docker-compose -f $(COMPOSE_DEV_FILE) exec backend-dev sh

# Shell nel container frontend
shell-frontend:
	docker-compose -f $(COMPOSE_DEV_FILE) exec frontend-dev sh

# Help
.PHONY: help
help:
	@echo "Comandi disponibili:"
	@echo "  Production:"
	@echo "    build       - Build di tutti i servizi"
	@echo "    up          - Avvia tutti i servizi"
	@echo "    down        - Ferma tutti i servizi"
	@echo "    logs        - Mostra i logs"
	@echo "    rebuild     - Rebuild completo"
	@echo ""
	@echo "  Development:"
	@echo "    dev-build   - Build per sviluppo"
	@echo "    dev-up      - Avvia in modalità sviluppo"
	@echo "    dev-down    - Ferma sviluppo"
	@echo "    dev-logs    - Logs sviluppo"
	@echo "    dev-rebuild - Rebuild sviluppo"
	@echo ""
	@echo "  Database:"
	@echo "    db-reset    - Reset del database"
	@echo "    db-seed     - Seed con dati di esempio"
	@echo "    db-backup   - Backup del database"
	@echo ""
	@echo "  Utility:"
	@echo "    status      - Stato dei container"
	@echo "    clean       - Pulisce tutto"
	@echo "    shell-backend   - Shell nel backend"
	@echo "    shell-frontend  - Shell nel frontend"
