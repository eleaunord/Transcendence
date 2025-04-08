export function HomePage() {
  return `
    <div class="flex flex-col justify-center items-center h-screen bg-gray-900 text-white animate-fadeIn relative overflow-hidden">
      <!-- Aperçu du jeu derrière le contenu -->
      <div class="absolute inset-0 bg-cover bg-center filter blur-sm opacity-40" style="background-image: url('/src/assets/photo_pong.png');"></div>

      <!-- Contenu principal -->
      <div class="relative z-10 flex flex-col justify-center items-center">
        <h1 class="text-5xl font-extrabold mb-4">Bienvenue sur Transcendance !</h1>
        <p class="text-xl mb-8">Préparez-vous à jouer à un jeu classique avec vos amis.</p>
        
        <!-- Bouton pour démarrer le jeu -->
        <button id="startGameButton" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300">
          Commencer la partie
        </button>
      </div>
    </div>
  `;
}