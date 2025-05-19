import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import HomePage from "../front/Pages/index";
import NotificationsPage from "../front/Pages/notifications";
import WorkspacesPage from "./Pages/Workspaces";
import WorkspaceDetailPage from "./Pages/WorkspaceDetailPage";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "../front/Pages/AuthPage";
import ChannelPage from "./pages/ChannelPage";

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/workspaces" element={<WorkspacesPage />} />
                    <Route path="/workspace/:uuid" element={<WorkspaceDetailPage />} />
                    <Route path="/workspace/:uuid/channel/:channelId" element={<ChannelPage />} />
                    {/* Ajoute d'autres routes ici */}
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
