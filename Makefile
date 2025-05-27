# Nom du projet Docker Compose
COMPOSE = docker-compose

#script pour generation des certificats
CERT_SCRIPT = nginx/generate-certs.sh

# Démarrer tous les services
up: prepare
	@$(COMPOSE) up --build 

# Préparation : chmod + génération des certificats si absents
prepare: chmod certs

# Rend le script exécutable
chmod:
	@chmod +x $(CERT_SCRIPT)

# Génère les certificats si absents
certs:
	@./$(CERT_SCRIPT)

# force la generation de nouveaux certificats
regen-certs:
	rm -f nginx/certs/*.pem
	make certs

# Arrêter les services
down:
	@$(COMPOSE) down

# Supprimer les containers, les volumes, et les images intermédiaires
clean:
	@$(COMPOSE) down -v --rmi all --remove-orphans

# Rebuild complet
rebuild:
	@$(COMPOSE) down -v --remove-orphans
	@$(COMPOSE) build --no-cache
	@$(COMPOSE) up
