import React from "react";
import ReactDOM from "react-dom/client";
import App from "../front/App";
import "./styles/disableUserAgentStylesheet.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
