# 🎮 Transcendance

Projet fullstack développé dans le cadre de l'école 42.  
Une web app moderne basée sur React, TypeScript, Node.js et Docker.

---
 ## Notre projet est structuré de la maniére suivante: 

```
ft_transcendence/
├── backend/                ←   Backend Node.js avec Fastify + SQLite
│   ├── Dockerfile          ←
│   ├── package.json        ←   Dépendances, scripts (npm run dev, build, etc.)
│   ├── tsconfig.json       ←   Config TypeScript du backend
│   ├── index.ts            ←   Point d'entrée du serveur Fastify
│   ├── database/           ←   Base SQLite locale (non commitée)
│   │   └── data.db         ←   Fichier SQLite (généré au runtime)
├── frontend/               ←   App React avec Vite, Tailwind CSS, TypeScript
│   ├── Dockerfile          ←
│   ├── package.json        ←
│   ├── vite.config.ts      ←   Config Vite (port 3000)
│   ├── tailwind.config.ts  ←   Config Tailwind (fichiers à scanner)
│   ├── tsconfig.json       ←   Config TypeScript pour React
│   ├── index.html          ←   Page HTML principale, React se monte dans #root
│   └── src/                ←
│       ├── main.tsx        ←   Point d’entrée React
│       └── App.tsx         ← 	Composant principal
├── nginx/                  ←   Redirige / vers le front et /api vers le backend
│   └── default.conf        ←   Config pour reverse proxy NGINX
├── docker-compose.yml      ←   Orchestrateur Docker
├── .env                    ←   Variables d’environnement (non commitées)
└── .gitignore              ←   Ignore le `.env`, `*.db`, `node_modules`, etc.
```


### Etape 1 : Mise en place du Frontend (React, Vite, Typescript)

- Creation du frontend avec Vite, en utilisant React avec TypeScript comme Template:
    Permet d'avoir un projet Vite préconfiguré avec les pré requis.

#### * Pour React: 
```bash  
            npm create vite@latest frontend -- --template react-ts 
            cd frontend
            npm install
```
#### * Pour Tailwind:
```bash 
            npm install -D tailwindcss postcss autoprefixer
            npx tailwindcss init -p  
            ou 
            npm install -D tailwindcss postcss autoprefixer
```
Cela permet de personnaliser Tailwind (Théme, couleur, plugins, etc..)
On personnalise les fichiers tailwind.config.ts et src/index.css et on s assure que main.tsx importe bien le fichier
Pour tester le frontend :
```bash
 npm run dev 
```

Puis on va sur [http://localhost:5173] (http://localhost:5173) pour voir la page React de base apparaitre
    
> ⚠️  Il faut verifier la version de node qui est installé
Pour l'installation si ca n'a pas encore été fait:
``` bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.zshrc  # ou ~/.bashrc selon le shell pour le redemarrer
nvm install 20
nvm use 20
node -v  # Doit afficher v20.xx.x
npm -v   # Doit afficher 10.xx.x ou plus
```
Si l'installation bloque : Ecrire tailwind.config.ts et postcss.config.js a la main
-> Pour tester que tout fonctionne à cette etape on peut rqjouter un test visuel Tailwind via src/App.tsx et Et dans src/main.tsx

> ⚠️  Dans VS Code, il peut être utile d'installer l'extension officielle Tailwind 

Il ne reste plus qu'a Dockeriser le frontend en y incluant Nginx

### Etape 2 : Mise en place du Backend en Fastify (Node.js + TypeScript)

```bash
mkdir backend
cd backend
npm init -y
npm install fastify
npm install -D typescript ts-node-dev @types/node
npx tsc --init
```

On modifie les fichier backend/tsconfig.json, backend/index.ts et  backend/package.json

Pour tester localement :

``` bash 
npm run dev
```

On va ensuite sur [http://localhost:3001/api/ping]
Normalement { "pong": true } doit s'afficher


### Etape 3 : Ajout de SQLite dnas le backend

Dans backend/ 

```bash 
mkdir database
touch database/data.db
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

On vient mettre a jour index.ts avec une table et une route (/api/users)

Pour tester localement on peut faire:

```bash
npm run dev
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
curl http://localhost:3001/api/users

```
On doit voir s'afficher  :
```json 
[
  { "id": 1, "name": "Alice" }
]
```