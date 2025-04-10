import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importer useNavigate pour la redirection

export function GamePage() {
  const navigate = useNavigate();  // Hook pour la navigation

  // Déclarer l'état panelOpen avec useState pour gérer l'ouverture/fermeture du panneau
  const [panelOpen, setPanelOpen] = useState<boolean>(true);  // Initialiser l'état à `true` pour que le panneau soit ouvert au début
  const [isClicked, setIsClicked] = useState<boolean>(false); // État pour suivre si le bouton a été cliqué

  // Fonction pour basculer l'état du panneau
  const togglePanel = () => {
    setPanelOpen((prevState) => !prevState);  // Inverse l'état du panneau (ouvert/fermé)
    setIsClicked(true);  // Marque que le bouton a été cliqué
    setTimeout(() => setIsClicked(false), 300);  // Réinitialise après 300ms
  };

  // Fonction pour revenir à la page de personnalisation
  const goBackToCustomization = () => {
    navigate('/customization');  // Rediriger vers la page de personnalisation
  };

  // Fonction pour aller au profil de l'utilisateur
  const goToUserProfile = () => {
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
                  src="/assets/photo_profil.png"
                  alt="Player Profile"
                  className="w-24 h-24 rounded-full border-4 border-white cursor-pointer"
                  onClick={goToUserProfile}  // Redirection vers le profil utilisateur
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

        {/* Cadre central pour le jeu */}
        <div className="flex-1 bg-gray-900 flex justify-center items-center">
          <div className="w-3/4 h-3/4 border-4 border-white flex justify-center items-center">
            <img src="/assets/photo_pong.png" alt="Game Preview" className="w-full h-full object-cover rounded-lg" />
          </div>
        </div>
      </div>

      {/* Bouton pour faire coulisser l'encadré gauche */}
      <button
        onClick={togglePanel}  // Utilisation de l'événement React pour toggler l'état
        className={`fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-600 p-3 rounded-r-md hover:bg-blue-700 focus:outline-none transition-transform duration-300 ${isClicked ? 'rotate-180' : ''}`}
      >
        <span className="text-white">≡</span> {/* Symbole de menu coulissant */}
      </button>

      {/* Bouton pour revenir à la personnalisation */}
      <button
        onClick={goBackToCustomization}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
      >
        Retour à la personnalisation
      </button>
    </div>
  );
}
