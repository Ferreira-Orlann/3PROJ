// src/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";

// Pages
import LoginPage from "../front/Pages/AuthPage";
import WorkspacesPage from "../front/Pages/workspaces";
import PrivateChatPage from "../front/Pages/PrivateChatPage";
import NotificationsPage from "../front/Pages/NotificationsPage";
import WorkspaceDetailPage from "../front/Pages/WorkspaceDetailPage";
import ChannelPage from "../front/Pages/ChannelPage"; 

// Layout
import ProtectedLayout from "../front/components/layout/ProtectedLayout";

const AppRoutes = () => {
  const { session } = useAuthContext();

  return (
    <Routes>
      {/* Redirection selon la session */}
      <Route
        path="/"
        element={<Navigate to={session ? "/workspaces" : "/login"} replace />}
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Routes protégées avec sidebar */}
      <Route element={<ProtectedLayout />}>
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/workspace/:uuid" element={<WorkspaceDetailPage />} />
        <Route path="/workspace/:workspaceId/channel/:channelId" element={<ChannelPage />} /> {/* ✅ Route ajoutée */}
        <Route path="/chat/private/:userUuid" element={<PrivateChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
