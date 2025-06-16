import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/workspacesPage.module.css";

import CreateWorkspaceModal from "../components/workspaces/CreateWorkspaceModal";
import workspaceService from "../services/workspaces.service";
import { workspaceMembersService } from "../services/workspaceMembers.service";
import authService from "../services/auth.service";

const WorkspacesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const session = authService.getSession();
  if (!session) return <p>Utilisateur non connecté</p>;
  const userUuid = session.owner;

  const fetchWorkspaces = async () => {
    try {
      const allWorkspaces = await workspaceService.getAll();
      const filteredWorkspaces = [];

      for (const workspace of allWorkspaces) {
        try {
          const members = await workspaceMembersService.getAll(workspace.uuid);
          const isMember = members.some(
            (member: any) => member.user?.uuid === userUuid
          );

          if (isMember) {
            filteredWorkspaces.push(workspace);
          }
        } catch (err) {
          console.warn(`Erreur pour les membres de ${workspace.name}`, err);
        }
      }

      setWorkspaces(filteredWorkspaces);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des workspaces:", err);
      setError(err.message || "Erreur inconnue");
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const goToWorkspace = (workspace: any) => {
    navigate(`/workspace/${workspace.uuid}`, { state: workspace });
  };

  return (
    <div className={styles.main}>
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

      {showModal && (
        <CreateWorkspaceModal
          onClose={() => setShowModal(false)}
          onWorkspaceCreated={fetchWorkspaces}
        />
      )}
    </div>
  );
};

export default WorkspacesPage;
