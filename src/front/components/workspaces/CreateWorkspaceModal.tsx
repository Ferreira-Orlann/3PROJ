import React, { useState } from "react";
import styles from "../../styles/workspacesPage.module.css";

interface CreateWorkspaceModalProps {
    onClose: () => void;
    onWorkspaceCreated: () => void;
}

// ⚠️ Token en dur (exemple uniquement pour test local)
const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiJ9.NjA0YWNmYWItZTFmYy00MjAzLWE2MjItMzUwZTk5MzNkNGY0.LcLp3yFB9r2CHil2RM0iZrTDZUcqqpadUSz3X6MyH90"; // Remplace par ton vrai token JWT

const CreateWorkspaceModal = ({ onClose, onWorkspaceCreated }: CreateWorkspaceModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!HARDCODED_TOKEN) {
            setError("Token manquant.");
            return;
        }

        if (!name || !description) {
            setError("Tous les champs sont requis.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/workspaces", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HARDCODED_TOKEN}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    description,
                    is_public: visibility === "public",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    setError("Token invalide ou expiré.");
                } else {
                    setError(errorData.message || "Erreur lors de la création.");
                }
                throw new Error(errorData.message || "Erreur lors de la création");
            }

            const data = await response.json();
            console.log("Workspace créé:", data);

            onWorkspaceCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Créer un nouvel espace de travail</h2>

                {error && <p className={styles.error}>{error}</p>}

                <input
                    type="text"
                    placeholder="Nom de l'espace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="public">Public</option>
                    <option value="private">Privé</option>
                </select>

                <div className={styles.modalButtons}>
                    <button onClick={handleCreate} className={styles.createButton}>
                        Créer
                    </button>
                    <button onClick={onClose} className={styles.cancelButton}>
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkspaceModal;
