import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

// Remplace par ton vrai Client ID ici (depuis Google Cloud Console)
const clientId = "TON_CLIENT_ID_GOOGLE_OAUTH";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;

