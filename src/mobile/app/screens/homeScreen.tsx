import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { UUID } from "crypto";
import Sidebar from "../components/layout/Sidebar";
import BottomBar from "../components/layout/bottomBar";

// Import separated files
import { styles } from "../styles/home";
import {
    SearchBar,
    WorkspaceList,
    CreateWorkspaceModal,
    WorkspaceListContainer,
} from "./homeScreen.components";
import useWorkspaceScreen from "../hooks/useWorkspaces";

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleWorkspaceSelect = (workspaceId: UUID) => {
        console.log("Navigating to workspace with ID:", workspaceId);

        if (!workspaceId) {
            console.error("Erreur: ID du workspace non défini");
            return;
        }

        const id = typeof workspaceId === "object" ? workspaceId : workspaceId;

        console.log("ID formaté pour la navigation:", id);
        router.push({ pathname: "/screens/workspaces/[id]", params: { id } });
    };

    return (
        <>
            <Sidebar />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.mainContent}>
                    <WorkspaceListContainer
                        onSelectWorkspace={handleWorkspaceSelect}
                    />
                </View>
            </View>
            <BottomBar />
        </>
    );
}
