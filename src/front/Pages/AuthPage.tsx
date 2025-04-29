import React, { useState } from 'react';
import '../styles/auth.css';
import Signup from '../components/auth/Signup';
import Login from '../components/auth/ Login';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
        {isLogin ? <Login /> : <Signup />}
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
