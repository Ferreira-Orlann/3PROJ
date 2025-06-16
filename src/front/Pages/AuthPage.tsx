import React, { useState } from "react";
import "../styles/auth.css";
import { SESSION_LOCALSTORE_NAME } from "../consts";
import { Session } from "../types/auth";

import authService from "../services/auth.service";
import Signup from "../components/auth/Signup";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const succesful = await authService.login(email, password);
            if (!succesful) return;


            const session = authService.getSession();
            localStorage.setItem(
                SESSION_LOCALSTORE_NAME,
                JSON.stringify(session),
            );
            window.location.href = "/workspaces";
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        }
    };

    const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
        try {
            if (!credentialResponse.credential) {
                setError("Aucun token Google reçu");
                return;
            }

            const session = await authService.loginWithGoogle(credentialResponse.credential);

            localStorage.setItem(SESSION_LOCALSTORE_NAME, JSON.stringify(session));
            //window.location.href = "/workspaces";
        } catch (err: any) {
            setError(err.message || "Erreur lors de la connexion Google");
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Adresse e-mail"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                        />
                        <button onClick={handleLogin}>Se connecter</button>

                        <div style={{ marginTop: "20px" }}>
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => setError("Échec de la connexion avec Google")}
                            />
                        </div>

                        {error && <p style={{ color: "red" }}>{error}</p>}
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
