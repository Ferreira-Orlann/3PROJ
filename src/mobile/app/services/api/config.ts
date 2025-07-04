import { Platform } from "react-native";

let HOST = "192.168.1.177";
const PORT = "3000";

if (__DEV__) {
    if (Platform.OS === "android") {
        HOST = "10.0.2.2";
    } else if (Platform.OS === "ios") {
        HOST = "localhost";
    }
    
    HOST = "192.168.1.177";
}

export const API_BASE_URL = `http://${HOST}:${PORT}`;

export const DEFAULT_TIMEOUT = 3000; 

export const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
};
