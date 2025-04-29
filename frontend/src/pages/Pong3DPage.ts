import { createPongScene } from "../games/pong3d/PongScene";

export function createPong3DPage(navigate: (path: string) => void): HTMLElement {
  // Conteneur principal qui définit la taille
  const container = document.createElement("div");
  container.className = "w-full h-screen relative"; // plein écran, parent du canvas

  // Canvas Babylon.js
  const canvas = document.createElement("canvas");
  canvas.id = "pong-canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block"; // évite marges auto

  container.appendChild(canvas);

  // Bouton retour positionné dans le coin
  const backButton = document.createElement("button");
  backButton.textContent = "Retour à l'accueil";
  backButton.className = "absolute top-4 left-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md";
  backButton.onclick = () => navigate("/");

  container.appendChild(backButton);

  // Lancement du jeu
  createPongScene(canvas);

  return container;
}
