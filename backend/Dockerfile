# Étape 1 : Builder l'app avec TypeScript
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : Exécuter l'app compilée
FROM node:20-alpine

WORKDIR /app
# added
RUN apk add --no-cache python3 make g++

# Copie uniquement les fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY database ./database  
# Copie la base SQLite

RUN npm install --omit=dev

EXPOSE 3001

CMD ["node", "dist/index.js"]
