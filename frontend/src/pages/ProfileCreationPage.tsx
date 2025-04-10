import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileCreationPage() {
  const navigate = useNavigate();

  // États pour la gestion du profil
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/assets/photo_profil.png');  // Valeur par défaut
  const [selectedOption, setSelectedOption] = useState<'game' | 'customization'>('game');  // Choix entre aller au jeu ou à la customisation

  const handleProfileSubmit = () => {
    // Sauvegarder le profil dans le sessionStorage ou un autre système de gestion
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('profilePicture', profilePicture);

    // Selon l'option choisie, on redirige vers le jeu ou la personnalisation
    if (selectedOption === 'game') {
      navigate('/game');
    } else {
      navigate('/customization');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Créer votre profil</h1>

      <form id="profileForm" className="w-80 p-6 bg-gray-800 rounded-lg border-2 border-white">
        {/* Nom d'utilisateur */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-lg mb-2">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            className="w-full p-2 bg-gray-700 text-white rounded-lg"
            placeholder="Votre nom"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Choix de la photo de profil */}
        <div className="mb-4">
          <label className="block text-lg mb-2">Photo de profil</label>
          <div className="flex justify-center mb-4">
            <img
              src={profilePicture}
              alt="Player Profile"
              className="w-24 h-24 rounded-full border-4 border-white"
            />
          </div>
          {/* Tu peux ajouter un changement de photo ici plus tard si besoin */}
        </div>

        {/* Choix entre aller au jeu ou à la personnalisation */}
        <div className="mb-4">
          <div className="flex justify-around">
            <button
              type="button"
              onClick={() => setSelectedOption('game')}
              className={`px-4 py-2 ${selectedOption === 'game' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 text-white font-semibold rounded-lg`}
            >
              Aller au jeu
            </button>
            <button
              type="button"
              onClick={() => setSelectedOption('customization')}
              className={`px-4 py-2 ${selectedOption === 'customization' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 text-white font-semibold rounded-lg`}
            >
              Personnaliser
            </button>
          </div>
        </div>

        {/* Bouton pour soumettre le profil */}
        <button
          type="button"
          onClick={handleProfileSubmit}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          Confirmer
        </button>
      </form>
    </div>
  );
}
