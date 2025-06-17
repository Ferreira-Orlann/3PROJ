import { BrowserRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./AppRoutes";

const clientId = "1045079684157-9m71af2ln6f3capjav5vj05q1cha7ahk.apps.googleusercontent.com";

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

