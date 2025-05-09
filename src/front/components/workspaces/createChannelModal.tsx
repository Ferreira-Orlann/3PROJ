import React, { useState } from "react";
import styles from "../../styles/workspacesPage.module.css";

interface CreateChannelModalProps {
    workspaceUuid: string;
    onClose: () => void;
    onChannelCreated: () => void;
}

// ⚠️ Token en dur (exemple uniquement pour test local)
const HARDCODED_TOKEN = "eyJhbGciOiJIUzI1NiJ9.NjA0YWNmYWItZTFmYy00MjAzLWE2MjItMzUwZTk5MzNkNGY0.LcLp3yFB9r2CHil2RM0iZrTDZUcqqpadUSz3X6MyH90";

const CreateChannelModal = ({ workspaceUuid, onClose, onChannelCreated }: CreateChannelModalProps) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!HARDCODED_TOKEN) {
            setError("Token manquant.");
            return;
        }

        if (!name) {
            setError("Le nom du salon est requis.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/workspaces/${workspaceUuid}/channels`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HARDCODED_TOKEN}`,
                },
                credentials: "include",
                body: JSON.stringify({ name, workspaceUuid }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || "Erreur lors de la création du salon.");
                return;
            }

            const data = await response.json();
            console.log("Salon créé:", data);

            onChannelCreated();
            onClose();
        } catch (err: any) {
            setError(err.message || "Erreur inconnue");
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Créer un nouveau salon</h2>

                {error && <p className={styles.error}>{error}</p>}

                <input
                    type="text"
                    placeholder="Nom du salon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

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

export default CreateChannelModal;
