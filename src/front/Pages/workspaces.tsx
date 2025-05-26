import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/workspacesPage.module.css";

import Sidebar from "../components/layout/Sidebar";
import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";
import authService from "../services/auth.service";
import PrivateChatList from "../chat/PrivateChat";
import NotificationsSettings from "../components/settings/NotificationsSettings";
import workspaceService from "../services/workspaces.service";

const WorkspacesPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [workspaces, setWorkspaces] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    console.log("Session:", authService.getSession());

    const handleCreateWorkspace = (
        name: string,
        description: string,
        visibility: string,
    ) => {
        const newWorkspace = {
            id: (workspaces.length + 1).toString(),
            name,
            description,
            visibility,
            icon: name.charAt(0).toUpperCase(),
            channels: [],
        };
        setWorkspaces([newWorkspace, ...workspaces]);

        const fetchWorkspaces = async () => {
            try {
                const token = authService.getSession().token;
                console.log("Token récupéré :", token);

                const response = await fetch(
                    "http://localhost:3000/workspaces",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                if (!response.ok) {
                    throw new Error("Erreur lors du chargement des workspaces");
                }

                const data = await response.json();
                console.log("Workspaces chargés :", data);
                setWorkspaces(data);
            } catch (err: any) {
                setError(err.message || "Erreur inconnue");
            }
        };

        useEffect(() => {
            fetchWorkspaces();
        }, []);

        const goToWorkspace = (workspace: any) => {
            navigate(`/workspace/${workspace.uuid}`, { state: workspace });
        };
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
                <aside className={styles.sidebar}>
                    <h2 className={styles.sidebarTitle}>ESPACES DE TRAVAIL</h2>
                    <div className={styles.workspaceList}>
                        {workspaces.map((workspace: any) => (
                            <div
                                key={workspace.uuid}
                                className={styles.workspaceItem}
                                onClick={() => goToWorkspace(workspace)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className={styles.workspaceIcon}>
                                    {workspace.name.charAt(0).toUpperCase()}
                                </div>
                                <div className={styles.workspaceInfo}>
                                    <p>{workspace.name}</p>
                                    <span>
                                        {workspace.is_public
                                            ? "Public"
                                            : "Privé"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

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
                </main>

                {showModal && (
                    <CreateWorkspaceModal
                        onClose={() => setShowModal(false)}
                        onWorkspaceCreated={fetchWorkspaces}
                    />
                )}
            </div>
        );
    };
};

export default WorkspacesPage;
