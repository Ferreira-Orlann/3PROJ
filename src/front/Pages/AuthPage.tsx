import React, { useState } from 'react';
import '../styles/auth.css';
import Signup from '../components/auth/Signup'; // ⬅️ importe ton composant

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>

        {isLogin ? (
          // Tu mettras Login ici plus tard
          <p style={{ textAlign: 'center', margin: '30px 0' }}>Formulaire de connexion à venir</p>
        ) : (
          <Signup />
        )}

        <p>
          {isLogin ? "Pas encore de compte ?" : 'Déjà inscrit ?'}{' '}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "S'inscrire" : 'Se connecter'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
