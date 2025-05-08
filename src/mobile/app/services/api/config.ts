import { Platform } from "react-native";

// Configuration de l'adresse IP du serveur backend
let HOST = "192.168.1.111"; // Adresse IP Wi-Fi de votre ordinateur
const PORT = "3000";

// Ajustement pour les émulateurs
if (__DEV__) {
    if (Platform.OS === "android") {
        // L'émulateur Android utilise 10.0.2.2 pour accéder à localhost de la machine hôte
        HOST = "10.0.2.2";
    } else if (Platform.OS === "ios") {
        // L'émulateur iOS peut utiliser localhost directement
        HOST = "localhost";
    }

    // Pour les appareils physiques sur le même réseau Wi-Fi
    // Décommentez la ligne ci-dessous et remplacez par l'adresse IP actuelle de votre ordinateur
    HOST = "192.168.1.111";
}

export const API_BASE_URL = `http://${HOST}:${PORT}`;

export const DEFAULT_TIMEOUT = 10000;

export const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
};
