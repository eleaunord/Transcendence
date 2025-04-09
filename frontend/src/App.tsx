import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { CustomizationPage } from './pages/CustomizationPage';
import { GamePage } from './pages/GamePage';
import { UserProfilePage } from './pages/UserProfilePage';  // Assurez-vous que le chemin est correct

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/customization" element={<CustomizationPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/user-profile" element={<UserProfilePage />} />  {/* Route vers le profil utilisateur */}
      </Routes>
    </Router>
  );
};

export default App;
