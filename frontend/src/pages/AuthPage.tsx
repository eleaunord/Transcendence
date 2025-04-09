import React from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/customization');  // Redirige vers la page de personnalisation
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Authentification</h1>
      <form id="authForm" className="w-80 p-6 bg-gray-800 rounded-lg border-2 border-white">
        <div className="mb-4">
          <label htmlFor="username" className="block text-lg mb-2">Nom d'utilisateur</label>
          <input type="text" id="username" className="w-full p-2 bg-gray-700 text-white rounded-lg" placeholder="Votre nom" required />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-lg mb-2">Mot de passe</label>
          <input type="password" id="password" className="w-full p-2 bg-gray-700 text-white rounded-lg" placeholder="Votre mot de passe" required />
        </div>
        <button type="button" onClick={handleLogin} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
          Se connecter
        </button>
      </form>
    </div>
  );
}
