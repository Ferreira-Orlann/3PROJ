import { Platform } from "react-native";

let HOST = "172.20.10.5";
const PORT = "3000";

if (__DEV__) {
    if (Platform.OS === "android") {
        HOST = "10.0.2.2";
    } else if (Platform.OS === "ios") {
        HOST = "localhost";
    }

    HOST = "172.20.10.5";
}

export const API_BASE_URL = `http://${HOST}:${PORT}`;

export const DEFAULT_TIMEOUT = 10000;

export const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
};
