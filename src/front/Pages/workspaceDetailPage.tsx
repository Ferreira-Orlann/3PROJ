import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";
import authService from "../services/auth.service";
import Member from "../components/workspaces/Member";
import { channelService } from "../services/channel.service";
import CreateChannelModal from "../components/workspaces/CreateChannelModal";
import { Workspace } from "../types/workspace";
import workspacesService from "../services/workspaces.service";
import { UUID } from "crypto";

const WorkspaceDetailPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState<Workspace | null>(location.state || null);
    const [newName, setNewName] = useState(workspace?.name || "");
    const [message, setMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("members");
    const [members, setMembers] = useState<string[]>([]);

    const token = authService.getSession().token;
    const headers: any = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        if (!workspace) {
            workspacesService.getByUUID(uuid as UUID).then((ws) => {
                setWorkspace(ws);
                setNewName(ws.name);
            });
        }
    }, [uuid, workspace]);

    useEffect(() => {
        if (activeTab === "members") {
            setMembers(["Alice", "Bob", "Charlie"]); // Remplace par appel API réel si besoin
        }
    }, [activeTab]);

    const handleRename = async () => {
        if (!workspace || newName === workspace.name) {
            setEditing(false);
            return;
        }

        try {
            await workspacesService.update({ uuid: workspace.uuid, name: newName });
            setMessage("Nom mis à jour !");
            setWorkspace({ ...workspace, name: newName });
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Erreur inconnue");
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async () => {
        if (!workspace || !window.confirm("Confirmer la suppression ?")) return;
        setIsDeleting(true);
        setMessage("");

        try {
            await workspacesService.delete(workspace);
            setMessage("Workspace supprimé !");
            setTimeout(() => navigate("/workspaces"), 1000);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Erreur inconnue");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className={styles.headerBar}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <span>{workspace ? workspace.name?.charAt(0).toUpperCase() : "?"}</span>
                    </div>

                    <div className={styles.nameContainer}>
                        {editing ? (
                            <input
                                className={styles.nameInput}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRename();
                                    if (e.key === "Escape") setEditing(false);
                                }}
                                autoFocus
                            />
                        ) : (
                            <span className={styles.name} onClick={() => setEditing(true)}>
                                {newName}
                            </span>
                        )}
                        <span className={styles.uuid}>UUID: {workspace?.uuid || uuid}</span>
                    </div>

                    <div className={styles.tabBar}>
                        <button className={styles.tabButton} onClick={() => setActiveTab("channels")}>Canaux</button>
                        <button className={styles.tabButton} onClick={() => setActiveTab("members")}>Membres</button>
                        <button className={styles.tabButton} onClick={() => setActiveTab("settings")}>Paramètres</button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.deleteBtn}
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Suppression..." : "Supprimer"}
                    </button>
                </div>
            </div>

            {message && <p className={styles.message}>{message}</p>}

            <div className={styles.tabContent}>
                {activeTab === "members" && (
                    <div>
                        <h2>Membres du workspace</h2>
                        {members.map((name, index) => (
                            <Member key={index} name={name} />
                        ))}
                    </div>
                )}

                {activeTab === "channels" && (
                    <div>
                        <h2>Créer un canal</h2>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const input = form.elements.namedItem("channelName") as HTMLInputElement;
                                const name = input.value.trim();
                                if (!name || !workspace) return;

                                try {
                                    const response = await fetch(`http://localhost:3000/workspaces/${workspace.uuid}/channels`, {
                                        method: "POST",
                                        headers,
                                        body: JSON.stringify({ name, workspaceUuid: workspace.uuid }),
                                    });

                                    if (!response.ok) {
                                        const errorText = await response.text();
                                        throw new Error(errorText);
                                    }

                                    setMessage("Canal créé !");
                                    input.value = "";
                                } catch (error: any) {
                                    console.error("Erreur :", error);
                                    setMessage(error.message || "Erreur inconnue");
                                }
                            }}
                        >
                            <input type="text" name="channelName" placeholder="Nom du canal" required />
                            <button type="submit">Créer</button>
                        </form>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div>
                        <h2>Paramètres</h2>
                        <p>Configuration du workspace à venir…</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default WorkspaceDetailPage;
