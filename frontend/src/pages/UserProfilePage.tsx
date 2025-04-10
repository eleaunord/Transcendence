import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function UserProfilePage() {
  const navigate = useNavigate();

  const [profilePicture, setProfilePicture] = useState<string | null>(
    sessionStorage.getItem('profilePicture') || '/public/assets/photo_profil.png'
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [profileTheme, setProfileTheme] = useState<string>('bg-gray-900'); // utilisé uniquement comme backup de couleur
  const [backgroundImage, setBackgroundImage] = useState<string>('/public/assets/profile-themes/default_cover.jpg'); // default_cover utilisé ✅

  const [gameHistory, setGameHistory] = useState<any[]>([
    { opponent: 'AI', result: 'Win', date: '2025-04-09' },
    { opponent: 'PlayerTwo', result: 'Loss', date: '2025-04-08' },
    { opponent: 'AI', result: 'Win', date: '2025-04-07' },
  ]);
  const [playerLevel, setPlayerLevel] = useState<number>(5);

  const goBack = () => {
    navigate(-1);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const changeProfilePicture = (picture: string) => {
    setProfilePicture(picture);
    sessionStorage.setItem('profilePicture', picture);
    closeModal();
  };

  const changeProfileTheme = (theme: string, background: string) => {
    setProfileTheme(theme);
    setBackgroundImage(background);
  };

  const getPlayerBadge = (level: number) => {
    if (level <= 5) return 'Novice';
    if (level <= 10) return 'Intermediate';
    return 'Expert';
  };

  return (
    <div className="relative flex flex-col h-screen text-white overflow-hidden">
      {/* Background layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Header */}
      <header className="bg-blue-800 p-4 shadow-lg fixed top-0 left-0 w-full z-20">
        <h1 className="text-3xl font-bold text-center">Profil Utilisateur</h1>
      </header>

      {/* Contenu */}
      <div className="flex flex-1 justify-center items-center mt-20 z-10">
        <div className={`w-3/4 p-6 rounded-lg border-2 border-white bg-gray-900/80`}>
          {/* Thèmes */}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => changeProfileTheme('bg-red-600', '/public/assets/profile-themes/stars.jpg')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            >
              Thème 1
            </button>
            <button
              onClick={() => changeProfileTheme('bg-green-600', '/public/assets/profile-themes/moon_sun_black.jpg')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg"
            >
              Thème 2
            </button>
            <button
              onClick={() => changeProfileTheme('bg-blue-600', '/public/assets/profile-themes/moon_sun_blue.jpg')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Thème 3
            </button>
          </div>

          {/* Photo de profil */}
          <div className="flex justify-center mb-4 relative">
            <img
              src={profilePicture || '/public/assets/photo_profil.png'}
              alt="Player Profile"
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <button
              onClick={openModal}
              className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            >
              ✨
            </button>
          </div>

          {/* Infos joueur */}
          <div className="bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4">
            <ul className="space-y-4 text-center text-lg">
              <li><strong>Username:</strong> PlayerOne</li>
              <li><strong>Level:</strong> {playerLevel} ({getPlayerBadge(playerLevel)})</li>
              <li><strong>Wins:</strong> 10</li>
            </ul>
          </div>

          {/* Historique */}
          <div className="bg-gray-700/80 p-4 rounded-lg border-2 border-white mb-4">
            <h3 className="text-xl text-center mb-4">Historique des Parties</h3>
            <ul className="space-y-2">
              {gameHistory.map((game, index) => (
                <li key={index}>
                  {game.date} - Opponent: {game.opponent} - Result: {game.result}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bouton retour */}
      <button
        onClick={goBack}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg z-30"
      >
        Retour
      </button>

      {/* Modale de sélection de photo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Choisissez une nouvelle photo</h2>
            <div className="grid grid-cols-3 gap-4">
              {['star_icon.jpg', 'bigstar_icon.jpg', 'moon_icon.jpg', 'sun_icon.jpg', 'fire_icon.jpg'].map((image, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                  onClick={() => changeProfilePicture(`/public/assets/profile-pictures/${image}`)}
                >
                  <img
                    src={`/public/assets/profile-pictures/${image}`}
                    alt={`Option ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              ))}
              <div
                className="cursor-pointer bg-gray-600 flex justify-center items-center text-white font-semibold rounded-lg"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <span>+</span> Télécharger
              </div>
            </div>

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (reader.result) {
                      changeProfilePicture(reader.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <button
              onClick={closeModal}
              className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
