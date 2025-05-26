import React from "react";
import styles from "../../styles/workspacesPage.module.css";

interface Workspace {
  uuid: string;
  name: string;
}

interface WorkspacesListProps {
  workspaces: Workspace[];
  onWorkspaceClick: (workspace: Workspace) => void;
}

const WorkspacesList: React.FC<WorkspacesListProps> = ({ workspaces, onWorkspaceClick }) => {
  return (
    <div className={styles.workspaceCards}>
      {workspaces.map((workspace) => (
        <div
          key={workspace.uuid}
          className={styles.workspaceCard}
          onClick={() => onWorkspaceClick(workspace)}
        >
          <div className={styles.workspaceAvatar}>
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <p>{workspace.name}</p>
        </div>
      ))}
    </div>
  );
};

export default WorkspacesList;
