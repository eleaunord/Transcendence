import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CustomizationPage() {
  const navigate = useNavigate();

  // État pour la couleur des raquettes et la vitesse de la balle
  const [paddleColor, setPaddleColor] = useState<string>('#00ff00');
  const [ballSpeed, setBallSpeed] = useState<number>(5);
  const [panelOpen, setPanelOpen] = useState<boolean>(true);  // Pour gérer l'état du panneau coulissant

  // Fonction pour basculer l'état du panneau
  const togglePanel = () => {
    setPanelOpen((prevState) => !prevState);  // Inverse l'état du panneau (ouvert/fermé)
  };

  // Fonction pour sauvegarder et démarrer le jeu
  const handleStartGame = () => {
    // Sauvegarder les données dans sessionStorage ou dans un autre état global si nécessaire
    sessionStorage.setItem('paddleColor', paddleColor);
    sessionStorage.setItem('ballSpeed', ballSpeed.toString());

    // Rediriger vers la page du jeu
    navigate('/game');
  };

  // Fonction pour aller au profil de l'utilisateur
  const handleGoToUserProfile = () => {
    navigate('/user-profile');  // Redirige vers la page du profil utilisateur
  };

  return (
    <div className="flex flex-col h-screen bg-blue-900 text-white">
      {/* Header */}
      <header className="bg-blue-800 p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Transcendance</h1>
      </header>

      <div className="flex flex-1">
        {/* Encadré vertical coulissant à gauche */}
        <div
          id="leftPanel"
          className={`transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-64' : 'w-px'
          } ${panelOpen ? 'bg-gray-800 p-4' : 'bg-blue-600'} p-4 overflow-y-auto`} // Animation de transition de largeur et couleur de la barre
        >
          {panelOpen ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Profil</h2>

              {/* Photo du joueur qui redirige vers le profil utilisateur */}
              <div className="flex justify-center mb-4">
                <img
                  src="/src/assets/photo_profil.png"
                  alt="Player Profile"
                  className="w-24 h-24 rounded-full border-4 border-white cursor-pointer"
                  onClick={handleGoToUserProfile}  // Redirection vers la page du profil
                />
              </div>

              {/* Encadré pour les informations du joueur */}
              <div className="bg-gray-700 p-4 rounded-lg border-2 border-white">
                <ul className="space-y-4 text-center text-lg text-white">
                  <li><strong>Username:</strong> PlayerOne</li>
                  <li><strong>Level:</strong> 5</li>
                  <li><strong>Wins:</strong> 10</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-blue-600"></div>  // Barre colorée uniquement lorsque le panneau est fermé
          )}
        </div>

        {/* Cadre central pour la personnalisation */}
        <div className="flex-1 bg-gray-900 flex justify-center items-center">
          <div className="w-3/4 h-3/4 border-4 border-white flex justify-center items-center">
            <form id="customizationForm" className="w-full p-6 bg-gray-800 rounded-lg border-2 border-white">
              {/* Couleur des raquettes */}
              <div className="mb-4">
                <label htmlFor="paddleColor" className="block text-lg mb-2">Couleur des raquettes</label>
                <input
                  type="color"
                  id="paddleColor"
                  className="w-full p-2"
                  value={paddleColor}
                  onChange={(e) => setPaddleColor(e.target.value)}  // Gérer le changement de couleur
                />
              </div>

              {/* Vitesse de la balle */}
              <div className="mb-4">
                <label htmlFor="ballSpeed" className="block text-lg mb-2">Vitesse de la balle</label>
                <input
                  type="range"
                  id="ballSpeed"
                  min="1"
                  max="10"
                  className="w-full p-2"
                  value={ballSpeed}
                  onChange={(e) => setBallSpeed(Number(e.target.value))}  // Gérer le changement de vitesse
                />
              </div>

              {/* Bouton pour commencer le jeu */}
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Commencer la partie
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bouton pour faire coulisser l'encadré gauche */}
      <button
        onClick={togglePanel}  // Utilisation de l'événement React pour toggler l'état du panneau
        className="fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-600 p-3 rounded-r-md hover:bg-blue-700 focus:outline-none"
      >
        <span className="text-white">≡</span> {/* Symbole de menu coulissant */}
      </button>
    </div>
  );
}
