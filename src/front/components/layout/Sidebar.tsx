// src/components/layout/Sidebar.tsx
import styles from "../../styles/workspacesPage.module.css";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSection}>
      <h3 className={styles.sidebarSubtitle}>Navigation</h3>
        <ul className={styles.sidebarList}>
          <li
            className={activeTab === "workspaces" ? styles.active : ""}
            onClick={() => setActiveTab("workspaces")}
          >
            🧩 Espaces de travail
          </li>
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSubtitle}>Discussions</h3>
        <ul className={styles.sidebarList}>
          <li
            className={activeTab === "chats" ? styles.active : ""}
            onClick={() => setActiveTab("chats")}
          >
            💬 Discussions privées
          </li>
        </ul>
      </div>

      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSubtitle}>Paramètres</h3>
        <ul className={styles.sidebarList}>
          <li
            className={activeTab === "settings" ? styles.active : ""}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Notifications
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
