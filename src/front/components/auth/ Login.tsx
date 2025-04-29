import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

const Login = () => {
    const [uuid, setUuid] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/auth/login?uuid=${uuid}`,
            );
            if (!response.ok) throw new Error("Échec de la connexion");
            const data = await response.json();

            login({ uuid: data.uuid }, data.token); // Save user + token
            navigate("/dashboard"); // redirect after login
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        }
    };

    return (
        <form onSubmit={handleLogin} className="auth-form">
            <input
                type="text"
                placeholder="UUID"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                required
            />
            <button type="submit">Se connecter</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default Login;
