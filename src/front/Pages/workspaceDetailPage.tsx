import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";
import authService from "../services/auth.service";

const WorkspaceDetailPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const workspace = location.state;

    const [newName, setNewName] = useState(workspace?.name || "");
    const [message, setMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const token = authService.getSession().token;

    const headers: any = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const handleRename = async () => {
        try {
            const response = await fetch(
                `http://localhost:3000/workspaces/${uuid}`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ name: newName }),
                },
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Échec du renommage");
            }

            setMessage("Nom mis à jour avec succès !");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Une erreur inconnue s'est produite.",
            );
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Es-tu sûr de vouloir supprimer ce workspace ?",
        );
        if (!confirmDelete) return;

        setIsDeleting(true);
        setMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/workspaces/${uuid}`,
                {
                    method: "DELETE",
                    headers,
                },
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Échec de la suppression");
            }

            setMessage("Workspace supprimé avec succès !");
            setTimeout(() => {
                navigate("/workspaces");
            }, 1000);
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Une erreur inconnue s'est produite.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span>{workspace?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className={styles.name}>{workspace?.name}</h2>
                        <p className={styles.uuid}>UUID : {workspace?.uuid}</p>
                    </div>
                </div>

                <div className={styles.form}>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nouveau nom"
                        className={styles.input}
                    />
                    <button className={styles.renameBtn} onClick={handleRename}>
                        Renommer
                    </button>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Suppression..." : "Supprimer"}
                    </button>
                    <button className={styles.chatBtn}>Tchat</button>
                </div>

                {message && <p className={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

export default WorkspaceDetailPage;
