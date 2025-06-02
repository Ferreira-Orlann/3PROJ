import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";
import Member from "../components/workspaces/Member";
import { channelService } from "../services/channel.service";
import { Workspace } from "../types/workspace";
import workspacesService from "../services/workspaces.service";
import {useRenameWorkspace} from "../hooks/useRenameWorkspace";
import { UUID } from "crypto";
import { useWorkspaceMembers } from "../hooks/useWorkspaceMembers";
import { AddMemberForm } from "../components/workspaces/addMembre";

const WorkspaceDetailPage = () => {
  const { uuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<Workspace | null>(location.state || null);
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "channels" | "settings">("members");

  const { members, loading, error } = useWorkspaceMembers(uuid!);
  const [channels, setChannels] = useState<{ uuid: string; name: string }[]>([]);
  const [newChannelName, setNewChannelName] = useState("");

  // Pour renommage dans paramètres
  const [editName, setEditName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // Charger le workspace si non fourni via la navigation
  useEffect(() => {
    if (!workspace && uuid) {
      workspacesService.getByUUID(uuid as UUID)
        .then(ws => {
          setWorkspace(ws);
          setEditName(ws.name);
        })
        .catch(() => {
          setMessage("Erreur lors du chargement du workspace");
        });
    } else if (workspace) {
      setEditName(workspace.name);
    }
  }, [uuid, workspace]);

  // Charger les canaux quand l’onglet "channels" est actif
  useEffect(() => {
    if (activeTab === "channels" && uuid) {
      channelService.getAllFiltered(uuid)
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


  const { rename} = useRenameWorkspace();

  // Fonction pour renommer le workspace
  const handleRename = async () => {
    if (!workspace) return;

    const trimmedName = editName.trim();
    if (trimmedName === "") {
      setMessage("Le nom ne peut pas être vide.");
      return;
    }

    if (trimmedName === workspace.name) {
      setIsEditingName(false);
      return;
    }

    try {
       rename(  workspace.uuid,  trimmedName );
      setWorkspace({ ...workspace, name: trimmedName });
      setMessage("Nom mis à jour !");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setIsEditingName(false);
    }
  };

  // Suppression du workspace
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

  // Création d’un nouveau canal
  const handleCreateChannel = async () => {
    if (!uuid || !newChannelName.trim()) return;

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
            <span className={styles.name}>
              {workspace?.name || "Chargement..."}
            </span>
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
                      uuid={member.uuid}
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

                <AddMemberForm workspaceId={workspace.uuid} />


            {/* Renommage */}
            <div>
              <label htmlFor="renameInput"><strong>Renommer le workspace :</strong></label>
              {isEditingName ? (
                <>
                  <input
                    id="renameInput"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") {
                        setEditName(workspace.name);
                        setIsEditingName(false);
                        setMessage("");
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleRename}
                    disabled={editName.trim() === "" || editName === workspace.name}
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => {
                      setEditName(workspace.name);
                      setIsEditingName(false);
                      setMessage("");
                    }}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditingName(true)}>
                  Modifier le nom
                </button>
              )}
            </div>

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
