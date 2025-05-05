import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthPage from "../front/Pages/AuthPage"; // 👈 On change ici
import HomePage from "../front/Pages/index";
import NotificationsPage from "../front/Pages/notifications";
import WorkspacesPage from "./Pages/Workspaces";
import WorkspaceDetailPage from "./Pages/WorkspaceDetailPage";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AuthPage />} />{" "}
                {/* 👈 Page de login au démarrage */}
                <Route path="/dashboard" element={<HomePage />} />{" "}
                {/* 👈 Page principale renommée */}
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route
                    path="/workspace/:uuid"
                    element={<WorkspaceDetailPage />}
                />{" "}
                {/* L'ID sera passé ici */}
            </Routes>
        </Router>
    );
};

export default App;
