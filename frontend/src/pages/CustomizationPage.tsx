import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CustomizationPage() {
  const navigate = useNavigate();

  // États pour la personnalisation
  const [panelOpen, setPanelOpen] = useState<boolean>(true);  // Pour gérer l'état du panneau coulissant

  // Fonction pour basculer l'état du panneau
  const togglePanel = () => {
    setPanelOpen((prevState) => !prevState);
  };

  // Fonction pour sauvegarder et démarrer le jeu
  const handleStartGame = () => {
    navigate('/game');
  };

  // Fonction pour aller au profil de l'utilisateur
  const handleGoToUserProfile = () => {
    navigate('/user-profile');  // Redirige vers la page du profil utilisateur
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-blue-800 p-4 shadow-lg z-10">
        <h1 className="text-3xl font-bold text-center">Transcendance</h1>
      </header>

      <div className="flex flex-1 pt-16"> {/* Retirer tout espace, assure que le contenu commence sous le header */}
        {/* Encadré vertical coulissant à gauche (Profil joueur) */}
        <div
          id="leftPanel"
          className={`transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-64' : 'w-px'
          } ${panelOpen ? 'bg-gray-800 p-4' : 'bg-blue-600'} p-4 overflow-y-auto`}
        >
          {panelOpen ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Profil</h2>

              {/* Photo du joueur */}
              <div className="flex justify-center mb-4">
                <img
                  src="/public/assets/photo_profil.png"
                  alt="Player Profile"
                  className="w-24 h-24 rounded-full border-4 border-white cursor-pointer"
                  onClick={handleGoToUserProfile}  // Redirection vers le profil utilisateur
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
            <div className="w-full h-full bg-blue-600"></div>
          )}
        </div>

        {/* Cadre central de personnalisation */}
        <div className="flex-1 bg-gray-900 flex justify-center items-center">
          <div className="w-3/4 h-3/4 border-4 border-white flex justify-center items-center bg-gray-800 rounded-lg">
            {/* Bouton pour démarrer le jeu */}
            <button
              type="button"
              onClick={handleStartGame}
              className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full flex items-center justify-center"
            >
              START
            </button>
          </div>
        </div>
      </div>

      {/* Bouton pour faire coulisser l'encadré gauche */}
      <button
        onClick={togglePanel}
        className="fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-600 p-3 rounded-r-md hover:bg-blue-700 focus:outline-none"
      >
        <span className="text-white">≡</span> {/* Symbole de menu coulissant */}
      </button>
    </div>
  );
}

