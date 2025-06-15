import { Navigator, Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthProvider from "./context/AuthContext";
import ReduxProvider from "./store/ReduxProvider";
import { LogBox } from "react-native";
import Slot = Navigator.Slot;

LogBox.ignoreAllLogs(true);
export default function RootLayout() {
    return (
        <AuthProvider>
            <ReduxProvider>
                <SafeAreaProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: "#1a1d21" },
                        }}
                    />
                </SafeAreaProvider>
            </ReduxProvider>
        </AuthProvider>
    );
}
