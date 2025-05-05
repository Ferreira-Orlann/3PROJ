import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";

const WorkspaceDetailPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const workspace = location.state;

    const [newName, setNewName] = useState(workspace?.name || "");
    const [message, setMessage] = useState("");

    const token = "eyJhbGciOiJIUzI1NiJ9.NjA0YWNmYWItZTFmYy00MjAzLWE2MjItMzUwZTk5MzNkNGY0.LcLp3yFB9r2CHil2RM0iZrTDZUcqqpadUSz3X6MyH90"; // Remplace par un vrai token si possible

    const headers: any = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const handleRename = async () => {
        try {
            const response = await fetch(`http://localhost:3000/workspaces/${uuid}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Échec du renommage");
            }

            setMessage("Nom mis à jour avec succès !");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Une erreur inconnue s'est produite.");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Es-tu sûr de vouloir supprimer ce workspace ?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/workspaces/${uuid}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Échec de la suppression");
            }

            setMessage("Workspace supprimé avec succès !");
            setTimeout(() => {
                navigate("/workspaces"); // Redirige vers la page d’accueil des workspaces
            }, 1000);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Une erreur inconnue s'est produite.");
        }
    };

    return (
        <div className={styles.container}>
            <h1>Détails de l’espace de travail</h1>
            <h2>Nom actuel : {workspace?.name}</h2>
            <h3>UUID : {workspace?.uuid}</h3>

            <div className={styles.renameSection}>
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nouveau nom"
                    className={styles.input}
                />
                <button className={styles.button} onClick={handleRename}>
                    Renommer
                </button>
            </div>

            <div className={styles.actions}>
                <button className={styles.button} onClick={handleDelete}>Supprimer</button>
                <button className={styles.button}>Tchat</button>
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default WorkspaceDetailPage;
