import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

// Importation des fichiers séparés
import { useProfileManagement } from "../../hooks/profils";
import { styles } from "../../styles/profils";

export default function ProfileScreen() {
    // États locaux pour suivre les différentes opérations
    const [isSaving, setIsSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const {
        userProfile,
        updateProfile,
        preferences,
        setPreferences,
        connectedProviders,
        toggleOAuthConnection,
        passwordInfo,
        updatePasswordInfo,
        showPasswordModal,
        setShowPasswordModal,
        changePassword,
        resetPasswordInfo,
        isExporting,
        exportUserData,
        saveProfile,
        isLoading, // Utiliser l'état de chargement du hook au lieu de le gérer localement
    } = useProfileManagement();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Profil</Text>
                <TouchableOpacity
                    onPress={async () => {
                        setIsSaving(true);
                        try {
                            await saveProfile();
                        } catch (error) {
                            console.error(
                                "Erreur lors de la sauvegarde du profil:",
                                error,
                            );
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving || isLoading}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButton}>Enregistrer</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {isLoading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 20,
                        }}
                    >
                        <ActivityIndicator size="large" color="#9c5fff" />
                        <Text
                            style={{
                                marginTop: 10,
                                color: "#9c5fff",
                                fontSize: 16,
                                textAlign: "center",
                            }}
                        >
                            Chargement de votre profil...
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {userProfile.firstName.charAt(0)}
                                    {userProfile.lastName.charAt(0)}
                                </Text>
                                <TouchableOpacity
                                    style={styles.editAvatarButton}
                                >
                                    <FontAwesome
                                        name="camera"
                                        size={16}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Informations personnelles
                    </Text>

                    <Text style={styles.label}>Nom d'utilisateur</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="user"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            value={userProfile.username}
                            onChangeText={(value) =>
                                updateProfile("username", value)
                            }
                            placeholder="Nom d'utilisateur"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Prénom</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="id-card"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            value={userProfile.firstName}
                            onChangeText={(value) =>
                                updateProfile("firstName", value)
                            }
                            placeholder="Prénom"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Nom</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="id-card-o"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            value={userProfile.lastName}
                            onChangeText={(value) =>
                                updateProfile("lastName", value)
                            }
                            placeholder="Nom"
                            placeholderTextColor="#666"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome
                            name="envelope"
                            size={20}
                            color="#666"
                            style={styles.icon}
                        />
                        <TextInput
                            style={styles.input}
                            value={userProfile.email}
                            onChangeText={(value) =>
                                updateProfile("email", value)
                            }
                            placeholder="Email"
                            placeholderTextColor="#666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Bio</Text>
                    <View style={[styles.inputContainer, styles.bioContainer]}>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={userProfile.bio}
                            onChangeText={(value) =>
                                updateProfile("bio", value)
                            }
                            placeholder="Parlez-nous de vous"
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Préférences</Text>

                    <View style={styles.preferenceItem}>
                        <Text style={styles.preferenceLabel}>Thème sombre</Text>
                        <Switch
                            trackColor={{ false: "#767577", true: "#9c5fff" }}
                            thumbColor={
                                preferences.isDarkTheme ? "#f5dd4b" : "#f4f3f4"
                            }
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() =>
                                setPreferences((prev) => ({
                                    ...prev,
                                    isDarkTheme: !prev.isDarkTheme,
                                }))
                            }
                            value={preferences.isDarkTheme}
                        />
                    </View>

                    <Text style={[styles.label, { marginTop: 15 }]}>
                        Statut personnalisé
                    </Text>
                    <View style={styles.statusContainer}>
                        <TouchableOpacity
                            style={[
                                styles.statusOption,
                                userProfile.status === "En ligne" &&
                                    styles.statusActive,
                            ]}
                            onPress={() => updateProfile("status", "En ligne")}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: "#00c851" },
                                ]}
                            />
                            <Text style={styles.statusText}>En ligne</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusOption,
                                userProfile.status === "Absent" &&
                                    styles.statusActive,
                            ]}
                            onPress={() => updateProfile("status", "Absent")}
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: "#ffbb33" },
                                ]}
                            />
                            <Text style={styles.statusText}>Absent</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusOption,
                                userProfile.status === "Ne pas déranger" &&
                                    styles.statusActive,
                            ]}
                            onPress={() =>
                                updateProfile("status", "Ne pas déranger")
                            }
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: "#ff4444" },
                                ]}
                            />
                            <Text style={styles.statusText}>
                                Ne pas déranger
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.statusOption,
                                userProfile.status === "Hors ligne" &&
                                    styles.statusActive,
                            ]}
                            onPress={() =>
                                updateProfile("status", "Hors ligne")
                            }
                        >
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: "#888" },
                                ]}
                            />
                            <Text style={styles.statusText}>Hors ligne</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sécurité</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowPasswordModal(true)}
                    >
                        <FontAwesome
                            name="lock"
                            size={20}
                            color="#fff"
                            style={styles.actionIcon}
                        />
                        <Text style={styles.actionText}>
                            Modifier le mot de passe
                        </Text>
                        <FontAwesome
                            name="chevron-right"
                            size={16}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Connexions externes (OAuth2)
                    </Text>

                    <View style={styles.oauthContainer}>
                        <View style={styles.oauthItem}>
                            <View style={styles.oauthInfo}>
                                <FontAwesome
                                    name="google"
                                    size={20}
                                    color="#DB4437"
                                    style={styles.oauthIcon}
                                />
                                <Text style={styles.oauthText}>Google</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.oauthButton,
                                    connectedProviders.google
                                        ? styles.disconnectButton
                                        : styles.connectButton,
                                ]}
                                onPress={() => toggleOAuthConnection("google")}
                            >
                                <Text style={styles.oauthButtonText}>
                                    {connectedProviders.google
                                        ? "Déconnecter"
                                        : "Connecter"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.oauthItem}>
                            <View style={styles.oauthInfo}>
                                <FontAwesome
                                    name="github"
                                    size={20}
                                    color="#fff"
                                    style={styles.oauthIcon}
                                />
                                <Text style={styles.oauthText}>GitHub</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.oauthButton,
                                    connectedProviders.github
                                        ? styles.disconnectButton
                                        : styles.connectButton,
                                ]}
                                onPress={() => toggleOAuthConnection("github")}
                            >
                                <Text style={styles.oauthButtonText}>
                                    {connectedProviders.github
                                        ? "Déconnecter"
                                        : "Connecter"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.oauthItem}>
                            <View style={styles.oauthInfo}>
                                <FontAwesome
                                    name="windows"
                                    size={20}
                                    color="#00a1f1"
                                    style={styles.oauthIcon}
                                />
                                <Text style={styles.oauthText}>Microsoft</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.oauthButton,
                                    connectedProviders.microsoft
                                        ? styles.disconnectButton
                                        : styles.connectButton,
                                ]}
                                onPress={() =>
                                    toggleOAuthConnection("microsoft")
                                }
                            >
                                <Text style={styles.oauthButtonText}>
                                    {connectedProviders.microsoft
                                        ? "Déconnecter"
                                        : "Connecter"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>RGPD</Text>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={exportUserData}
                    >
                        <FontAwesome
                            name="download"
                            size={20}
                            color="#fff"
                            style={styles.actionIcon}
                        />
                        <Text style={styles.actionText}>
                            Exporter mes données personnelles
                        </Text>
                        {isExporting ? (
                            <ActivityIndicator size="small" color="#9c5fff" />
                        ) : (
                            <FontAwesome
                                name="chevron-right"
                                size={16}
                                color="#666"
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Password change modal */}
                <Modal
                    visible={showPasswordModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                Modifier le mot de passe
                            </Text>

                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalLabel}>
                                    Mot de passe actuel
                                </Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={passwordInfo.currentPassword}
                                    onChangeText={(value) =>
                                        updatePasswordInfo(
                                            "currentPassword",
                                            value,
                                        )
                                    }
                                    placeholder="Entrez votre mot de passe actuel"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalLabel}>
                                    Nouveau mot de passe
                                </Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={passwordInfo.newPassword}
                                    onChangeText={(value) =>
                                        updatePasswordInfo("newPassword", value)
                                    }
                                    placeholder="Entrez votre nouveau mot de passe"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.modalInputContainer}>
                                <Text style={styles.modalLabel}>
                                    Confirmer le mot de passe
                                </Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={passwordInfo.confirmPassword}
                                    onChangeText={(value) =>
                                        updatePasswordInfo(
                                            "confirmPassword",
                                            value,
                                        )
                                    }
                                    placeholder="Confirmez votre nouveau mot de passe"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalCancelButton,
                                    ]}
                                    onPress={() => {
                                        setShowPasswordModal(false);
                                        resetPasswordInfo();
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>
                                        Annuler
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.modalSaveButton,
                                    ]}
                                    onPress={async () => {
                                        setChangingPassword(true);
                                        try {
                                            await changePassword();
                                        } catch (error) {
                                            console.error(
                                                "Erreur lors du changement de mot de passe:",
                                                error,
                                            );
                                        } finally {
                                            setChangingPassword(false);
                                        }
                                    }}
                                    disabled={changingPassword}
                                >
                                    {changingPassword ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                        />
                                    ) : (
                                        <Text style={styles.modalButtonText}>
                                            Enregistrer
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    );
}
