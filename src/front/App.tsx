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


const App = () => {
    return (
        <GoogleOAuthProvider clientId="1045079684157-9m71af2ln6f3capjav5vj05q1cha7ahk.apps.googleusercontent.com">
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
                    </Routes>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    );
};


export default App;
