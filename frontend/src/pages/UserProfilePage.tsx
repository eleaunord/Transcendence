import React from 'react';
import { useNavigate } from 'react-router-dom';

export function UserProfilePage() {
  const navigate = useNavigate();

  // Fonction pour revenir à la page précédente ou à la personnalisation
  const goBack = () => {
    navigate(-1);  // Retour à la page précédente
  };

  return (
    <div className="flex flex-col h-screen bg-blue-900 text-white">
      {/* Header */}
      <header className="bg-blue-800 p-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center">Profil Utilisateur</h1>
      </header>

      {/* Contenu du profil */}
      <div className="flex flex-1 justify-center items-center">
        <div className="w-3/4 p-6 bg-gray-800 rounded-lg border-2 border-white">
          {/* Photo du joueur */}
          <div className="flex justify-center mb-4">
            <img src="/src/assets/photo_profil.png" alt="Player Profile" className="w-32 h-32 rounded-full border-4 border-white" />
          </div>

          {/* Informations du joueur */}
          <div className="bg-gray-700 p-4 rounded-lg border-2 border-white">
            <ul className="space-y-4 text-center text-lg text-white">
              <li><strong>Username:</strong> PlayerOne</li>
              <li><strong>Level:</strong> 5</li>
              <li><strong>Wins:</strong> 10</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bouton de retour */}
      <button
        onClick={goBack}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
      >
        Retour
      </button>
    </div>
  );
}

