import React, { useState } from "react";
import styles from "../../styles/workspacesPage.module.css";
import authService from "../../services/auth.service";
import workspacesService from "../../services/workspaces.service";

interface CreateWorkspaceModalProps {
    onClose: () => void;
    onWorkspaceCreated: () => void;
}

const CreateWorkspaceModal = ({ onClose, onWorkspaceCreated }: CreateWorkspaceModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!name || !description) {
            setError("Tous les champs sont requis.");
            return;
        }

        try {
            const data = workspacesService.create(name, description, visibility == "public")
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
