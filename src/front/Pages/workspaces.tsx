// src/front/pages/WorkspacesPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Bell, User, Settings } from "lucide-react";
import styles from "../styles/workspacesPage.module.css";

import Sidebar from "../components/layout/Sidebar";
import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";
import PrivateChatList from "../chat/PrivateChat";
import NotificationsSettings from "../components/settings/NotificationsSettings";
import workspaceService from "../services/workspaces.service";

const WorkspacesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("workspaces");

  const navigate = useNavigate();

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des workspaces:", err);
      setError(err.message || "Erreur inconnue");
    }
  };
 
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Redirige vers un workspace spécifique
  const goToWorkspace = (workspace: any) => {
    navigate(`/workspace/${workspace.uuid}`, { state: workspace });
  };

  return (
    <div className={styles.container}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>Vos espaces de travail</h1>
          <button
            className={styles.createButton}
            onClick={() => setShowModal(true)}
          >
            Créer un espace de travail
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* Contenu dynamique selon l'onglet sélectionné */}
        {activeTab === "workspaces" && (
          <div className={styles.workspaceCards}>
            {workspaces.map((workspace: any) => (
              <div
                key={workspace.uuid}
                className={styles.workspaceCard}
                onClick={() => goToWorkspace(workspace)}
              >
                <div className={styles.workspaceAvatar}>
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <p>{workspace.name}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "chats" && <PrivateChatList />}
        {activeTab === "settings" && <NotificationsSettings />}
      </main>

      {showModal && (
        <CreateWorkspaceModal
        onClose={() => setShowModal(false)}
        onCreate={async (name, description, visibility) => {
          try {
            const isPublic = visibility === "public"; // conversion string → boolean
            await workspaceService.create(name, description, isPublic);
            setShowModal(false);
            const updated = await workspaceService.getAll();
            setWorkspaces(updated);
          } catch (error) {
            console.error("Erreur lors de la création du workspace :", error);
            setError("Erreur lors de la création du workspace");
          }
        }}
      />      

      )}
    </div>
  );
};

export default WorkspacesPage;
