# all: 
# 	@echo "Building and starting containers..."
# 	docker compose -f docker-compose.yml up --build -d
	
# down: 
# 	@echo "Stopping and cleaning containers..."
# 	docker compose -f docker-compose.yml down -v
# 	docker system prune -af

# re: down all


# Nom du projet Docker Compose
COMPOSE = docker-compose

# Démarrer tous les services
up:
	@$(COMPOSE) up --build

# Arrêter les services
down:
	@$(COMPOSE) down

# Supprimer les containers, les volumes, et les images intermédiaires
clean:
	@$(COMPOSE) down -v --rmi all --remove-orphans

# Voir les logs en live
logs:
	@$(COMPOSE) logs -f

# Rebuild complet
rebuild:
	@$(COMPOSE) down -v --remove-orphans
	@$(COMPOSE) build --no-cache
	@$(COMPOSE) up
