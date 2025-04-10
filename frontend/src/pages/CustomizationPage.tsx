import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importer useNavigate pour la redirection

export function CustomizationPage() {
  const navigate = useNavigate();

  // États pour la personnalisation
  const [panelOpen, setPanelOpen] = useState<boolean>(true);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('/public/assets/game-themes/default_cover.jpg');

  const togglePanel = () => {
    setPanelOpen((prevState) => !prevState);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleGoToUserProfile = () => {
    navigate('/user-profile');
  };

  const changeTheme = (background: string) => {
    setBackgroundImage(background);
  };

  return (
    <div className="relative flex flex-col h-screen text-white overflow-hidden">
      {/* Layer pour le background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Header */}
      <header className="bg-blue-800 p-4 shadow-lg z-20 relative">
        <h1 className="text-3xl font-bold text-center">Transcendance</h1>
      </header>

      <div className="flex flex-1 z-10">
        {/* Encadré vertical coulissant à gauche (Profil joueur) */}
        <div
          id="leftPanel"
          className={`transition-all duration-300 ease-in-out ${
            panelOpen ? 'w-64' : 'w-px'
          } ${panelOpen ? 'bg-gray-800/80 p-4' : 'bg-blue-600'} p-4 overflow-y-auto z-10`}
        >
          {panelOpen ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">Profil</h2>
              <div className="flex justify-center mb-4">
                <img
                  src="/assets/photo_profil.png"
                  alt="Player Profile"
                  className="w-24 h-24 rounded-full border-4 border-white cursor-pointer"
                  onClick={handleGoToUserProfile}
                />
              </div>
              <div className="bg-gray-700/80 p-4 rounded-lg border-2 border-white">
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

        {/* Cadre central de personnalisation avec bouton START */}
        <div className="flex-1 flex justify-center items-center p-6 relative z-10">
          <div className="w-3/4 h-3/4 border-4 border-white flex justify-center items-center bg-gray-800/80 rounded-lg relative z-20">
            {/* Section pour les thèmes */}
            <div className="flex justify-between w-full mb-4 absolute top-0 z-30 px-4 py-2">
              <button
                onClick={() => changeTheme('/public/assets/game-themes/dust.jpg')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
              >
                Thème 1
              </button>
              <button
                onClick={() => changeTheme('/public/assets/game-themes/moon_dust.jpg')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
              >
                Thème 2
              </button>
              <button
                onClick={() => changeTheme('/public/assets/game-themes/star_dust.jpg')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
              >
                Thème 3
              </button>
            </div>

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
        className={`fixed top-1/2 left-0 transform -translate-y-1/2 bg-blue-600 p-3 rounded-r-md hover:bg-blue-700 focus:outline-none transition-transform duration-300 z-30 ${isClicked ? 'rotate-180' : ''}`}
      >
        <span className="text-white">≡</span>
      </button>
    </div>
  );
}
