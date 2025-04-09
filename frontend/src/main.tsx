import React from 'react';
import ReactDOM from 'react-dom/client';  // Utilise le client spécifique pour React 18+
import App from './App';  // Assure-toi que App est bien importé

// Créer un root React
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Rendre l'application dans l'élément avec l'id "root"
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);