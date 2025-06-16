// src/layout/ProtectedLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import styles from "../../styles/protectedLayout.module.css";

const ProtectedLayout = () => {
  const [activeTab, setActiveTab] = useState("workspaces");
  const navigate = useNavigate();
  const location = useLocation();

  // Gère la navigation auto
  useEffect(() => {
    if (activeTab === "workspaces") navigate("/workspaces");
    else if (activeTab === "chats") navigate("/chat/private/me");
    else if (activeTab === "settings") navigate("/notifications");
  }, [activeTab]);

  // Gère l'onglet actif à l’arrivée
  useEffect(() => {
    if (location.pathname.startsWith("/workspaces")) setActiveTab("workspaces");
    else if (location.pathname.startsWith("/chat/private")) setActiveTab("chats");
    else if (location.pathname.startsWith("/notifications")) setActiveTab("settings");
  }, [location.pathname]);

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
