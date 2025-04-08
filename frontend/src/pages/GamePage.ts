export function GamePage() {
    return `
      <div class="flex flex-col h-screen bg-blue-900 text-white">
        <!-- Header -->
        <header class="bg-blue-800 p-4 shadow-lg">
          <h1 class="text-3xl font-bold text-center">Transcendance</h1>
        </header>
    
        <div class="flex flex-1">
          <!-- Encadré vertical coulissant à gauche -->
          <div id="leftPanel" class="w-64 bg-gray-800 p-4 overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4 text-center">Profil</h2>
              
            <!-- Photo du joueur -->
            <div class="flex justify-center mb-4">
              <img src="/src/assets/photo_profil.png" alt="Player Profile" class="w-24 h-24 rounded-full border-4 border-white" />
            </div>
    
            <!-- Encadré pour les informations du joueur -->
            <div class="bg-gray-700 p-4 rounded-lg border-2 border-white">
              <ul class="space-y-4 text-center text-lg text-white">
                <li><strong>Username:</strong> PlayerOne</li>
                <li><strong>Line 1:</strong> Level 5</li>
                <li><strong>Line 2:</strong> Wins: 10</li>
              </ul>
            </div>
          </div>
    
          <!-- Cadre central pour le jeu (remplaçant par une image d'aperçu) -->
          <div class="flex-1 bg-gray-900 flex justify-center items-center">
            <div class="w-3/4 h-3/4 border-4 border-white flex justify-center items-center">
              <img src="/src/assets/photo_pong.png" alt="Game Preview" class="w-full h-full object-cover rounded-lg" />
              <!-- Ici tu peux mettre une image d'aperçu du jeu -->
            </div>
          </div>
        </div>
    
        <!-- Bouton pour faire coulisser l'encadré gauche -->
        <button id="togglePanel" class="fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-600 p-3 rounded-r-md hover:bg-blue-700 focus:outline-none">
          <span class="text-white">≡</span> <!-- Symbole de menu coulissant -->
        </button>
      </div>
    `;
  }
  
  
  