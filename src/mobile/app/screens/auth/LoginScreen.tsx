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

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoading } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return;
        }

        try {
            await login(email, password);
        } catch (error) {
            Alert.alert("Erreur", "Email ou mot de passe incorrect");
        }
    };

    const handleGoogleLogin = () => {
        // TODO: Implement Google login
        Alert.alert("Info", "Connexion Google non implémentée");
    };

    const handleFacebookLogin = () => {
        // TODO: Implement Facebook login
        Alert.alert("Info", "Connexion Facebook non implémentée");
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

                <View style={styles.form}>
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

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>

                    <Text style={styles.orText}>Ou continuer avec</Text>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleGoogleLogin}
                        >
                            <FontAwesome name="google" size={20} color="#fff" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, styles.facebookButton]}
                            onPress={handleFacebookLogin}
                        >
                            <FontAwesome
                                name="facebook"
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.socialButtonText}>
                                Facebook
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/auth/register")}
                    >
                        <Text style={styles.registerText}>
                            Vous n'avez pas de compte ?{" "}
                            <Text style={styles.registerLink}>S'inscrire</Text>
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
        marginBottom: 40,
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
    loginButton: {
        backgroundColor: "#9c5fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    loginButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
    orText: {
        color: "#666",
        textAlign: "center",
        marginVertical: 20,
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4285f4",
        padding: 15,
        borderRadius: 10,
        flex: 0.48,
    },
    facebookButton: {
        backgroundColor: "#3b5998",
    },
    socialButtonText: {
        color: "#fff",
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "bold",
    },
    registerText: {
        color: "#666",
        textAlign: "center",
    },
    registerLink: {
        color: "#9c5fff",
        fontWeight: "bold",
    },
});
