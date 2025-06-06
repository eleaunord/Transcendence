# 🎮 What is Transcendence?

Transcendence is a web-based gaming platform and the final project of 42’s Common Core curriculum. The project started with a simple goal: recreate the classic Pong game. But like most things at 42, it turned out to be much more than that.

The idea was to go beyond what we were comfortable with — hence the name "Transcendence". We had to explore and integrate a wide range of unfamiliar technologies: secure user authentication (including 2FA), Dockerized deployments, tournaments, matchmaking, and even AI opponents.


<p align="center">
  
  ![image](https://github.com/user-attachments/assets/0ae4c340-88fa-4059-a836-209f4538d7d7)
  
</p>


Our final product is a web app where players can:

- Play Pong and Memory with friends and AI. 
- Create tournaments. 
- Customize their game experience.
- Track their performance and stats
- And more — all from a responsive and user-friendly single-page application


<p align="center">

![image](https://github.com/user-attachments/assets/7571262f-a2c7-466d-9228-7fccbf5ffd97)

</p>


For most of us, this was our first experience working on a full-stack app with real-world features like OAuth, 2FA, websocket communication, and Docker. Everything from the frontend to the backend was built from scratch or within strict constraints, often without frameworks or libraries that could do the heavy lifting for us. Even the images and artwork in the project were entirely designed by our own teammate and talented artist, Rime Younssi.

It wasn’t easy — but it was incredibly rewarding.

We learned not just how to code a game, but how to design a full software system, work as a team under pressure, and solve problems we’d never seen before. Transcendence pushed us out of our comfort zones — and helped us grow into real developers.

# 📚 Table of Contents
- 🕹️ [Try out the project](#-less-chit-chat-lets-play)
- 🛠️ [How we got started](#-how-we-got-started)
- 💻 [Technologies Used](#-technologies-used)
- 🧠 [What We Learned](#-what-we-learned)
- 🧑‍🤝‍🧑 [Meet the Team](#-meet-the-team)

---

## 🏓 Less chit chat, let’s play!

Want to try out the project on your own computer? (YES!) Here’s a step-by-step guide to run Transcendence locally.

*NB : Before you start, make sure you have these tools installed:*
- *Git – to download the project*
- *Docker – to run everything easily*
- *Make – (usually preinstalled on Mac/Linux)*

### Step 1: Clone the project

Open a terminal or command prompt, and type:
```
git clone https://github.com/your-username/transcendence.git
cd transcendence
```
This downloads the project onto your computer.

### Step 2: Start the app

```
make up
```

### Step 3: Open the app

Once it’s ready, open your browser and go to:
```
https://localhost:8443/ 
```

### To stop everything

When you're done playing:

```
make down
```
---

## 🚀 How we got started

### Step 1 — Frontend Setup with Vite, React & TypeScript

We began by setting up the frontend using Vite with a React + TypeScript template. This gave us a fast development environment and a clean project structure.

```
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

We also planned to use Tailwind CSS for styling, but later chose a custom CSS approach instead.

To run the frontend locally:

```
npm run dev
```
Then open http://localhost:5173 in your browser to see the default React page.

### Step 2 — Backend Setup with Node.js, Fastify & TypeScript

Next, we created the backend using Fastify, a lightweight and fast web framework for Node.js.

```
mkdir backend
cd backend
npm init -y
npm install fastify
npm install -D typescript ts-node-dev @types/node
npx tsc --init
```
We configured the tsconfig.json, set up a simple server in index.ts, and added scripts in package.json.

To run the backend locally:

```
npm run dev
```
You can test if it’s working by visiting:

```
http://localhost:3001/api/ping
```

### Step 3 — Adding SQLite to the Backend

For persistent storage, we added SQLite using the better-sqlite3 package:
```
mkdir database
touch database/data.db
npm install better-sqlite3
npm install -D @types/better-sqlite3
```
Then we updated the backend logic to include a basic users table and a route to create and list users:
```
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Gnouma"}'

curl http://localhost:3001/api/users
```
Which returns:

```
[
  { "id": 1, "name": "Gnouma" }
]
```
### Step 4 — Dockerization & NGINX Reverse Proxy

Finally, we brought everything together using Docker with an NGINX reverse proxy. The folder structure looked like this:

```
transcendence/
├── backend/                ←   Backend (Node.js with Fastify + SQLite)
│   ├── Dockerfile          ←   Docker setup for the backend
│   ├── package.json        ←   Dependencies and scripts (npm run dev, build, etc.)
│   ├── tsconfig.json       ←   TypeScript configuration for the backend
│   ├── index.ts            ←   Entry point for the Fastify server
│   ├── database/           ←   Local SQLite database (not committed)
│   │   └── data.db         ←   SQLite file (generated at runtime)
├── frontend/               ←   React app with Vite, Tailwind CSS, and TypeScript
│   ├── Dockerfile          ←   Docker setup for the frontend
│   ├── package.json        ←   Frontend dependencies and scripts
│   ├── vite.config.ts      ←   Vite configuration (port 3000)
│   ├── tailwind.config.ts  ←   Tailwind config (files to scan, theme, etc.)
│   ├── tsconfig.json       ←   TypeScript configuration for React
│   ├── index.html          ←   Main HTML file, React mounts into #root
│   └── src/                ←   Source folder for the frontend
│       ├── main.tsx        ←   React entry point
│       └── App.tsx         ←   Main React component
├── nginx/                  ←   Redirects `/` to the frontend and `/api` to the backend
│   └── default.conf        ←   NGINX reverse proxy configuration
├── docker-compose.yml      ←   Docker orchestrator file
├── .env                    ←   Environment variables (not committed)
└── .gitignore              ←   Ignores `.env`, `*.db`, `node_modules`, etc.

```
With one command, the whole app runs in Docker containers:

```
docker-compose up --build
```
---

## 💻 Technologies Used

- **Frontend**: React, Vite, TypeScript
- **Backend**: Node.js, Fastify, TypeScript
- **Database**: SQLite (with better-sqlite3)
- **Auth**: JWT, OAuth2, 2FA (TOTP)
- **Real-time**: WebSocket
- **Deployment**: Docker, Docker Compose, NGINX

---

## 🧠 What We Learned

- Building secure authentication from scratch (including 2FA)
- Managing a real-time multiplayer game with WebSockets
- Setting up and reverse-proxying a full Docker environment
- Collaborating effectively with Git and team roles
- Designing UI and game assets ourselves

---

## 🧑‍🤝‍🧑 Meet the Team

<p align="center">

![image](https://github.com/user-attachments/assets/fef54d48-b8f8-4672-a4d8-e00c66db1e83)

</p>


This project was done by 5 students from 42:

- Alix CERALINE
- Shinhye YUN
- Eleonore ROTY
- Gnouma DUKURAY
- Rime YOUNSSI 

Visit our app web page to learn more about us!

