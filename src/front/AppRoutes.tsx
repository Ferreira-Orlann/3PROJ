// src/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";

import LoginPage from "../front/Pages/AuthPage";
import WorkspacesPage from "../front/Pages/workspaces";
import PrivateChatPage from "../front/Pages/PrivateChatPage";
import NotificationsPage from "../front/Pages/NotificationsPage";
import ProtectedLayout from "../front/components/layout/ProtectedLayout";

const AppRoutes = () => {
  const { session } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={session ? "/workspaces" : "/login"} replace />}
      />
      <Route path="/login" element={<LoginPage />} />

      {/* Routes avec sidebar */}
      <Route element={<ProtectedLayout />}>
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/chat/private/:userUuid" element={<PrivateChatPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
