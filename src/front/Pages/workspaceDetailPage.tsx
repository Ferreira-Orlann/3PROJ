import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../styles/workspaceDetailPage.module.css";
import { Workspace } from "../types/workspace";
import workspacesService from "../services/workspaces.service";
import { UUID } from "crypto";

const WorkspaceDetailPage = () => {
    const { uuid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState<Workspace>(null)
    const [isDeleting, setIsDeleting] = useState(false);
    const stateWorkspace = location.state;

    useEffect(() => {
        if (workspace == null) {
            if (stateWorkspace) {
                setWorkspace({...stateWorkspace})
            } else if (!stateWorkspace) {
                workspacesService.getByUUID(uuid as UUID).then((workspace) => {
                    setWorkspace(workspace)
                })
            }
        }
    })

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span>{workspace ? workspace?.name?.charAt(0).toUpperCase() : "Unknown"}</span>
                    </div>
                    <div>
                        <h2 className={styles.name}>{workspace ? workspace.name : "Unknown"}</h2>
                        <p className={styles.uuid}>UUID : {workspace ? workspace.uuid : "Unknown"}</p>
                    </div>
                </div>

                <div className={styles.form}>
                    <input
                        type="text"
                        value={workspace ? workspace.name : "Unknown"}
                        onChange={(e) => {
                            workspace.name = e.target.value
                        }}
                        placeholder="Nouveau nom"
                        className={styles.input}
                    />
                    <button className={styles.renameBtn} onClick={() => {
                        workspacesService.update({name: workspace.name})
                        stateWorkspace.name = workspace.name
                    }}>
                        Renommer
                    </button>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.deleteBtn}
                        onClick={() => {
                            setIsDeleting(true)
                            workspacesService.delete(workspace).then(() => {
                                navigate("/workspaces")
                            })
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Suppression..." : "Supprimer"}
                    </button>
                    {/* <button className={styles.chatBtn}>Tchat</button> */}
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetailPage;
