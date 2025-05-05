import React, { useState } from "react";
import "../styles/auth.css";
import Signup from "../components/auth/Signup"; 

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');


    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // <-- ici
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Connexion échouée');
            }
    
            const data = await response.json();
            console.log('Session:', data);
    
            window.location.href = '/workspaces';
        } catch (err: any) {
            setError(err.message || 'Erreur inconnue');
        }
    };
    
      
    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isLogin ? "Connexion" : "Inscription"}</h2>

                {isLogin ? (
                    <>
                    <input
                        type="email"
                        //placeholder="Entrez votre adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
/>

                    <button onClick={handleLogin}>
                        Se connecter
                    </button>

                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    </>
              ) : (
                    <Signup />
                )}

                <p>
                    {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "S'inscrire" : "Se connecter"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
