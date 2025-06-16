import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import HomePage from "../front/Pages/index";
import NotificationsPage from "../front/Pages/NotificationsPage";
import WorkspacesPage from "./Pages/Workspaces";
import WorkspaceDetailPage from "./Pages/WorkspaceDetailPage";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "../front/Pages/AuthPage";
import ChannelPage from "./pages/ChannelPage";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PrivateChatPage from "./Pages/PrivateChatPage";


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
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/workspaces" replace />}
                    />
                    <Route path="/dashboard" element={<HomePage />} />{" "}
                    {/* 👈 Page principale renommée */}
                    <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                    />
                    <Route path="/workspaces" element={<WorkspacesPage />} />
                    <Route
                        path="/workspace/:uuid"
                        element={<WorkspaceDetailPage />}
                    />{" "}
                    {/* L'ID sera passé ici */}
                </Routes>
            </AuthProvider>
        </Router>
    );
};


export default App;
