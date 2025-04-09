import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function UserProfilePage() {
  const navigate = useNavigate();

  // État pour gérer la photo de profil actuelle
  const [profilePicture, setProfilePicture] = useState<string | null>(
    sessionStorage.getItem('profilePicture') || '/public/assets/photo_profil.png'
  );

  // État pour gérer l'affichage de la modale
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fonction pour revenir à la page précédente
  const goBack = () => {
    navigate(-1);  // Retour à la page précédente
  };

  // Fonction pour ouvrir la modale de changement de photo
  const openModal = () => {
    setIsModalOpen(true);  // Ouvre la modale
  };

  // Fonction pour fermer la modale
  const closeModal = () => {
    setIsModalOpen(false);  // Ferme la modale
  };

  // Fonction pour changer la photo de profil
  const changeProfilePicture = (picture: string) => {
    setProfilePicture(picture);  // Met à jour l'état de la photo de profil
    sessionStorage.setItem('profilePicture', picture);  // Sauvegarde la nouvelle photo dans sessionStorage
    closeModal();  // Ferme la modale après la sélection
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
          <div className="flex justify-center mb-4 relative">
            <img
              src={profilePicture || '/public/assets/photo_profil.png'}  // Valeur par défaut en cas de null
              alt="Player Profile"
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            {/* Bouton à côté de la photo de profil */}
            <button
              onClick={openModal}
              className="absolute top-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            >
              ✨
            </button>
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

      {/* Modale pour changer la photo de profil */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-3/4 md:w-1/2">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Choisissez une nouvelle photo</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* Affichage des 5 images prédéfinies */}
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

              {/* Option pour télécharger une nouvelle image */}
              <div
                className="cursor-pointer bg-gray-600 flex justify-center items-center text-white font-semibold rounded-lg"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <span>+</span> Télécharger
              </div>
            </div>

            {/* File input hidden */}
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
                      changeProfilePicture(reader.result as string);  // Met à jour avec la photo téléchargée
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
