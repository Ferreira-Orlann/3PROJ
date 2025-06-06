import React, { useState } from "react";
import "../styles/auth.css";
import authService from "../services/auth.service";
import Signup from "../components/auth/Signup";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const { user, session, setUser, setSession } = useAuthContext();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const succesful = await authService.login(email, password);
            if (!succesful) {
                return;
            }
            const session = authService.getSession();
            authService.saveSession();
            setSession(session);

            navigate("/workspaces");
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
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

                        <button onClick={handleLogin}>Se connecter</button>

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
