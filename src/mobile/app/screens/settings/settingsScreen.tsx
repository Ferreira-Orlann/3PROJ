import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
    const [darkMode, setDarkMode] = useState(true);
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la déconnexion",
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Paramètres</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apparence</Text>
                    <View style={styles.option}>
                        <View style={styles.optionInfo}>
                            <FontAwesome name="moon-o" size={20} color="#666" />
                            <Text style={styles.optionText}>Mode sombre</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#2a2d32", true: "#9c5fff" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.option}>
                        <View style={styles.optionInfo}>
                            <FontAwesome
                                name="envelope-o"
                                size={20}
                                color="#666"
                            />
                            <Text style={styles.optionText}>
                                Notifications par email
                            </Text>
                        </View>
                        <Switch
                            value={emailNotifs}
                            onValueChange={setEmailNotifs}
                            trackColor={{ false: "#2a2d32", true: "#9c5fff" }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={styles.option}>
                        <View style={styles.optionInfo}>
                            <FontAwesome name="bell-o" size={20} color="#666" />
                            <Text style={styles.optionText}>
                                Notifications push
                            </Text>
                        </View>
                        <Switch
                            value={pushNotifs}
                            onValueChange={setPushNotifs}
                            trackColor={{ false: "#2a2d32", true: "#9c5fff" }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Compte</Text>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => router.push("../profils")}
                    >
                        <View style={styles.optionInfo}>
                            <FontAwesome name="user-o" size={20} color="#666" />
                            <Text style={styles.optionText}>Profil</Text>
                        </View>
                        <FontAwesome
                            name="chevron-right"
                            size={16}
                            color="#666"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => router.push("../settings")}
                    >
                        <View style={styles.optionInfo}>
                            <FontAwesome name="lock" size={20} color="#666" />
                            <Text style={styles.optionText}>Sécurité</Text>
                        </View>
                        <FontAwesome
                            name="chevron-right"
                            size={16}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1d21",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d32",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    content: {
        flex: 1,
    },
    section: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2d32",
    },
    sectionTitle: {
        fontSize: 16,
        color: "#9c5fff",
        marginBottom: 15,
        fontWeight: "bold",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    optionInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        color: "#fff",
        marginLeft: 15,
        fontSize: 16,
    },
    logoutButton: {
        margin: 15,
        padding: 15,
        backgroundColor: "#2a2d32",
        borderRadius: 10,
        alignItems: "center",
    },
    logoutText: {
        color: "#ff4444",
        fontSize: 16,
        fontWeight: "bold",
    },
});
