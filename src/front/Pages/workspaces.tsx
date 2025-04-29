// src/front/pages/WorkspacesPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Bell, User, Settings } from "lucide-react";
import styles from "../styles/workspacesPage.module.css";
import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";

const WorkspacesPage = () => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([
        {
            id: "1",
            name: "Marketing",
            description: "Marketing team",
            visibility: "Public",
            icon: "M",
            channels: ["Général", "Projets"],
        },
        {
            id: "2",
            name: "Développement",
            description: "Dev team",
            visibility: "Public",
            icon: "D",
            channels: ["Frontend", "Backend"],
        },
        {
            id: "3",
            name: "RH",
            description: "Human resources",
            visibility: "Privé",
            icon: "R",
            channels: ["Recrutement", "Paie"],
        },
        {
            id: "4",
            name: "Direction",
            description: "Direction générale",
            visibility: "Privé",
            icon: "D",
            channels: ["Stratégie"],
        },
    ]);

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
    };

    const goToWorkspace = (workspace: any) => {
        navigate(`/workspace/${workspace.id}`, { state: workspace });
    };

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>ESPACES DE TRAVAIL</h2>
                <div className={styles.workspaceList}>
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            className={styles.workspaceItem}
                            onClick={() => goToWorkspace(workspace)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className={styles.workspaceIcon}>
                                {workspace.icon}
                            </div>
                            <div className={styles.workspaceInfo}>
                                <p>{workspace.name}</p>
                                <span>{workspace.visibility}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* autres sections */}
            </aside>

            {/* Main Content */}
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

                {/* Liste cartes */}
                <div className={styles.workspaceCards}>
                    {workspaces.map((workspace) => (
                        <div
                            key={workspace.id}
                            className={styles.workspaceCard}
                            onClick={() => goToWorkspace(workspace)}
                        >
                            <div className={styles.workspaceAvatar}>
                                {workspace.icon}
                            </div>
                            <p>{workspace.name}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <CreateWorkspaceModal
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreateWorkspace}
                />
            )}
        </div>
    );
};

export default WorkspacesPage;
