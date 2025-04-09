import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();  // Hook pour la navigation avec React Router

  // Fonction pour démarrer le jeu
  const handleStartGame = () => {
    navigate('/auth');  // Redirige vers la page d'authentification
  };

  return (
    <div className="relative flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      {/* Image de fond en transparence */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/public/assets/photo_pong.png)' }}
      ></div>

      {/* Contenu de la page */}
      <div className="relative z-10 flex flex-col justify-center items-center">
        <h1 className="text-5xl font-extrabold mb-4">Bienvenue sur Transcendance !</h1>
        <p className="text-xl mb-8">Préparez-vous à jouer à un jeu classique avec vos amis.</p>
        <button
          id="startGameButton"
          onClick={handleStartGame}  // Utilise le hook `useNavigate` pour rediriger
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
        >
          Commencer la partie
        </button>
      </div>
    </div>
  );
}

