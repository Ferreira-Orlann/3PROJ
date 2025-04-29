import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const { register, isLoading } = useAuth();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword || !username) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
            return;
        }

        try {
            await register(username, email, password);
        } catch (error) {
            Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de l'inscription",
            );
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9c5fff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <Text style={styles.title}>SUPCHAT</Text>
                <Text style={styles.subtitle}>Créez votre compte</Text>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="user"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="envelope"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Adresse email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="lock"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mot de passe"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="lock"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmer le mot de passe"
                            placeholderTextColor="#666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>
                            S'inscrire
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.loginText}>
                            Déjà un compte ?{" "}
                            <Text style={styles.loginLink}>Se connecter</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1d21",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1d21",
    },
    keyboardView: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 40,
    },
    form: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2d32",
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "#fff",
        paddingVertical: 15,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: "#9c5fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    registerButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginText: {
        color: "#666",
        textAlign: "center",
    },
    loginLink: {
        color: "#9c5fff",
        fontWeight: "bold",
    },
});
