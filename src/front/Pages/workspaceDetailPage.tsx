import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";
import authService from "../services/auth.service";
import Member from "../components/workspaces/Member";
import { channelService } from "../services/channel.service";
import { Workspace } from "../types/workspace";
import workspacesService from "../services/workspaces.service";
import { UUID } from "crypto";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";
import { useAddWorkspaceMember } from "../hooks/useAddWorkspaceMember";
import { useDeleteWorkspace } from "../hooks/useDeleteWorkspace";



const WorkspaceDetailPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [workspace, setWorkspace] = useState<Workspace | null>(location.state || null);
    const [newName, setNewName] = useState(workspace?.name || "");
    const [message, setMessage] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"members" | "channels" | "settings">("members");

    const { members, loading, error } = useWorkspaceMembers(uuid!);
    const [channels, setChannels] = useState<{ uuid: string; name: string }[]>([]);
    const [newChannelName, setNewChannelName] = useState("");

    // Charger le workspace si non fourni
    useEffect(() => {
        if (!workspace) {
            workspacesService.getByUUID(uuid as UUID)
                .then(ws => {
                    setWorkspace(ws);
                    setNewName(ws.name);
                })
                .catch(() => {
                    setMessage("Erreur lors du chargement du workspace");
                });
        }
    }, [uuid, workspace]);

    // Charger les canaux si l'onglet "channels" est actif
    useEffect(() => {
        if (activeTab === "channels") {
            channelService.getAllFiltered(uuid!)
                .then(setChannels)
                .catch((err) => {
                    console.error("Erreur fetch channels:", err);
                    setMessage(err.message || "Erreur lors du chargement des canaux");
                });
        }
    }, [activeTab, uuid]);
    

    useEffect(() => {
        setMessage("");
    }, [activeTab]);

    const handleRename = async () => {
        if (!workspace || newName === workspace.name) {
            setEditing(false);
            return;
        }

        try {
            await workspacesService.update({ uuid: workspace.uuid, name: newName });
            setWorkspace({ ...workspace, name: newName });
            setMessage("Nom mis à jour !");
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

    const handleCreateChannel = async () => {
        if (!uuid || !newChannelName.trim()) return;
        console.log("Création canal pour workspace UUID:", uuid);
    
        try {
            const newChannel = await channelService.create(uuid, newChannelName.trim());
            setChannels([...channels, newChannel]);
            setMessage("Canal créé avec succès !");
            setNewChannelName("");
        } catch (error: any) {
            setMessage(error.message || "Erreur lors de la création du canal");
        }
    };
    
    
    
    return (
        <>
            <div className={styles.headerBar}>
                <div className={styles.leftSection}>
                    <div className={styles.logo}>
                        <span>{workspace?.name?.charAt(0).toUpperCase() || "?"}</span>
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
                        <button
                            className={`${styles.tabButton} ${activeTab === "channels" ? styles.active : ""}`}
                            onClick={() => setActiveTab("channels")}
                        >
                            Canaux
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "members" ? styles.active : ""}`}
                            onClick={() => setActiveTab("members")}
                        >
                            Membres
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "settings" ? styles.active : ""}`}
                            onClick={() => setActiveTab("settings")}
                        >
                            Paramètres
                        </button>
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
                        {loading && <p>Chargement des membres...</p>}
                        {error && <p>Erreur : {error}</p>}
                        {!loading && !error && (
                            <>
                                {members.length === 0 ? (
                                    <p>Aucun membre trouvé.</p>
                                ) : (
                                    members.map((member) => (
                                        <Member
                                            key={member.uuid}
                                            name={member.user?.username || "Utilisateur inconnu"}
                                        />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                    
                )}

                {activeTab === "channels" && (
                    <div>
                        <h2>Canaux</h2>
                        <div className={styles.channelList}>
                            {channels.map((channel) => (
                                <div
                                    key={channel.uuid}
                                    className={styles.channelCard}
                                    onClick={() => navigate(`/workspace/${uuid}/channel/${channel.uuid}`)}
                                >
                                    <h3>{channel.name}</h3>
                                    <p>UUID: {channel.uuid}</p>
                                </div>
                            ))}
                        </div>

                        <h3>Créer un canal</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleCreateChannel();
                            }}
                        >
                            <input
                                type="text"
                                name="channelName"
                                placeholder="Nom du canal"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                required
                            />
                            <button type="submit">Créer</button>
                        </form>
                    </div>
                )}

{activeTab === "settings" && workspace && (
    <div className={styles.settingsTab}>
        <h2>Paramètres du workspace</h2>

        <p>
            <strong>Nom :</strong> {workspace.name}
        </p>
        <p>
            <strong>UUID :</strong> {workspace.uuid}
        </p>

        <hr style={{ margin: "1rem 0" }} />

        <h3 style={{ color: "red" }}>Danger Zone</h3>
        <p>La suppression du workspace est irréversible. Tous les canaux et données associées seront perdus.</p>

        <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={isDeleting}
        >
            {isDeleting ? "Suppression en cours..." : "Supprimer le workspace"}
        </button>
    </div>
)}

            </div>
        </>
    );
};

export default WorkspaceDetailPage;
