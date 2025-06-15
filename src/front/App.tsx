import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import HomePage from "../front/Pages/index";
import NotificationsPage from "../front/Pages/notifications";
import WorkspacesPage from "../front/Pages/workspaces";

import PrivateChatPage from "../front/Pages/PrivateChatPage";
import LoginPage from "../front/Pages/AuthPage";

import { AuthProvider, useAuthContext } from "./context/AuthContext";

// Sous-composant pour gérer les routes avec redirection en fonction de l'authentification
const AppRoutes = () => {
    const { session } = useAuthContext();

    return (
        <Routes>
            {/* Redirection conditionnelle depuis la racine */}
            <Route
                path="/"
                element={<Navigate to={session ? "/workspaces" : "/login"} replace />}
            />

            {/* Page de login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Routes accessibles après connexion */}
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/workspaces" element={<WorkspacesPage />} />

            <Route path="/chat/private/:userUuid" element={<PrivateChatPage />} />

        </Routes>
    );
};

// Composant principal
const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
};

export default App;
