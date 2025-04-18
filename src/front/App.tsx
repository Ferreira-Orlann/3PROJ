import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthPage from '../front/Pages/AuthPage'; // 👈 On change ici
import HomePage from '../front/Pages/index';
import NotificationsPage from '../front/Pages/notifications';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} /> {/* 👈 Page de login au démarrage */}
        <Route path="/dashboard" element={<HomePage />} /> {/* 👈 Page principale renommée */}
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
