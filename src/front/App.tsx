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
