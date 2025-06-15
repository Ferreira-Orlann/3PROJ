import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useAuth, User as AuthUser } from "../context/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
    UserPreferences,
    OAuthConnections,
    PasswordChangeInfo,
} from "../services/Profile";
import userService, { UpdateUserData, User as ApiUser } from "../services/api/endpoints/users";
// Remove the import for the traditional files service
// import filesService from "../services/api/endpoints/files";
// Use only the RTK Query implementation
import { useUploadFileMutation } from "../store/api/filesApi";

export interface UserProfile {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    bio: string;
    status: string;
    uuid?: string; // User UUID
    avatarFile?: {
        uri: string;
        name: string;
        type: string;
    };
}

export const useProfileManagement = () => {
    const { user } = useAuth();
    const [uploadFile] = useUploadFileMutation();
    
    const [userProfile, setUserProfile] = useState<UserProfile>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        status: "Hors ligne",
    });

    const [isLoading, setIsLoading] = useState(true);

    const [passwordInfo, setPasswordInfo] = useState<PasswordChangeInfo>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [preferences, setPreferences] = useState<UserPreferences>({
        isDarkTheme: true,
    });
    const [connectedProviders, setConnectedProviders] =
        useState<OAuthConnections>({
            google: false,
            github: true,
            microsoft: false,
        });

    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                const themePreference =
                    await AsyncStorage.getItem("themePreference");
                if (themePreference) {
                    setPreferences((prev) => ({
                        ...prev,
                        isDarkTheme: themePreference === "dark",
                    }));
                }

                console.log(
                    "Utilisation des données utilisateur depuis le contexte d'authentification:",
                    user,
                );
                const userData = user;

                if (userData) {
                    const nameParts = userData.username
                        ? userData.username.split(" ")
                        : ["", ""];
                    const firstName = nameParts[0] || "";
                    const lastName =
                        nameParts.length > 1
                            ? nameParts.slice(1).join(" ")
                            : "";

                    // Utiliser le type correct pour userData (AuthUser)
                    setUserProfile({
                        username: userData.username || "",
                        firstName: firstName,
                        lastName: lastName,
                        email: userData.email || "",
                        bio: "Développeur passionné",
                        status:
                            userData.status === "online"
                                ? "En ligne"
                                : userData.status === "away"
                                  ? "Absent"
                                  : "Hors ligne",
                        uuid: userData.uuid, // Store the user UUID from AuthContext
                    });

                    console.log(
                        "Profil utilisateur mis à jour avec les données de l'API",
                    );
                }

                const savedConnections =
                    await AsyncStorage.getItem("oauthConnections");
                if (savedConnections) {
                    setConnectedProviders(JSON.parse(savedConnections));
                }
            } catch (error) {
                console.error(
                    "Erreur lors du chargement des données utilisateur:",
                    error,
                );
                Alert.alert(
                    "Erreur",
                    "Impossible de charger votre profil. Vérifiez votre connexion internet.",
                );

                try {
                    const savedProfile =
                        await AsyncStorage.getItem("userProfile");
                    if (savedProfile) {
                        setUserProfile(JSON.parse(savedProfile));
                        console.log(
                            "Profil utilisateur chargé depuis le stockage local",
                        );
                    }
                } catch (fallbackError) {
                    console.error(
                        "Erreur lors du chargement du profil de secours:",
                        fallbackError,
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const updateProfile = (field: keyof UserProfile, value: string) => {
        setUserProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const updatePasswordInfo = (
        field: keyof PasswordChangeInfo,
        value: string,
    ) => {
        setPasswordInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetPasswordInfo = () => {
        setPasswordInfo({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const changePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordInfo;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs");
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
            return false;
        }

        try {
            await userService.changePassword(currentPassword, newPassword);

            Alert.alert(
                "Succès",
                "Votre mot de passe a été modifié avec succès",
            );
            setShowPasswordModal(false);
            resetPasswordInfo();
            return true;
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe:", error);
            Alert.alert(
                "Erreur",
                "Impossible de modifier le mot de passe. Vérifiez que votre mot de passe actuel est correct.",
            );
            return false;
        }
    };

    const saveProfile = async () => {
        try {
            if (!userProfile.uuid) {
                console.error("UUID de l'utilisateur manquant");
                Alert.alert(
                    "Erreur",
                    "Impossible de mettre à jour le profil: identifiant utilisateur manquant"
                );
                return;
            }
            
            console.log("Mise à jour du profil avec UUID:", userProfile.uuid);
            
            const userData: UpdateUserData = {
                username: userProfile.username,
                firstname: userProfile.firstName, // Required field
                lastname: userProfile.lastName,   // Required field
                email: userProfile.email,
                mdp: "password123",               // Required field - using a default value
                address: "123 Main St",           // Required field - using a default value
                status:
                    userProfile.status === "En ligne"
                        ? "en ligne"
                        : userProfile.status === "Absent"
                          ? "absent"
                          : "hors ligne",
                uuid: userProfile.uuid, // Include the user UUID for the API endpoint
            };
            
            console.log("Données utilisateur à envoyer:", JSON.stringify(userData));
            
            // Si une image de profil a été sélectionnée, l'uploader d'abord via l'API files
            if (userProfile.avatarFile) {
                try {
                    console.log("Uploading avatar file...", userProfile.avatarFile);
                    
                    // S'assurer que le fichier est correctement formaté pour l'API
                    const fileToUpload = {
                        uri: userProfile.avatarFile.uri,
                        name: userProfile.avatarFile.name || 'avatar.jpg',
                        type: userProfile.avatarFile.type || 'image/jpeg'
                    };
                    
                    console.log("Formatted file for upload:", fileToUpload);
                    const fileUploadResponse = await uploadFile(fileToUpload).unwrap();
                    console.log("Avatar file uploaded successfully, UUID:", fileUploadResponse);
                    
                    // Mettre à jour l'avatar avec l'UUID du fichier téléchargé
                    userData.avatar = fileUploadResponse;
                } catch (error) {
                    console.error("Error uploading avatar file:", error);
                    Alert.alert(
                        "Erreur",
                        "Impossible de télécharger l'image de profil"
                    );
                    // Continue sans mettre à jour l'avatar
                }
            }

            const updatedUser = await userService.updateProfile(userData);
            console.log(
                "Profil utilisateur mis à jour avec succès:",
                updatedUser,
            );

            await AsyncStorage.setItem(
                "themePreference",
                preferences.isDarkTheme ? "dark" : "light",
            );
            await AsyncStorage.setItem(
                "oauthConnections",
                JSON.stringify(connectedProviders),
            );

            await AsyncStorage.setItem(
                "userProfile",
                JSON.stringify(userProfile),
            );

            Alert.alert(
                "Succès",
                "Vos informations ont été mises à jour avec succès",
            );
            router.back();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du profil:", error);
            Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la mise à jour de votre profil",
            );
        }
    };

    const toggleOAuthConnection = async (provider: keyof OAuthConnections) => {
        if (connectedProviders[provider]) {
            setConnectedProviders({
                ...connectedProviders,
                [provider]: false,
            });
        } else {
            let authUrl = "";

            switch (provider) {
                case "google":
                    authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
                    break;
                case "github":
                    authUrl = "https://github.com/login/oauth/authorize";
                    break;
                case "microsoft":
                    authUrl =
                        "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
                    break;
            }

            if (authUrl) {
                try {
                    await WebBrowser.openBrowserAsync(authUrl);
                    setConnectedProviders({
                        ...connectedProviders,
                        [provider]: true,
                    });
                } catch (error) {
                    console.error(
                        `Erreur lors de la connexion à ${provider}:`,
                        error,
                    );
                    Alert.alert(
                        "Erreur",
                        `Une erreur est survenue lors de la connexion à ${provider}`,
                    );
                }
            }
        }
    };

    const exportUserData = async () => {
        try {
            setIsExporting(true);
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const userData = {
                ...userProfile,
                preferences,
                connectedProviders,
                exportDate: new Date().toISOString(),
            };

            await AsyncStorage.setItem("userData", JSON.stringify(userData));

            Alert.alert(
                "Données exportées",
                "Dans une implémentation réelle, un fichier JSON serait généré et partagé. " +
                    "Pour installer les dépendances nécessaires, exécutez: pnpm add expo-file-system expo-sharing expo-secure-store",
            );

            setIsExporting(false);
        } catch (error) {
            setIsExporting(false);
            console.error("Erreur lors de l'exportation des données:", error);
            Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de l'exportation de vos données",
            );
        }
    };

    return {
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
        isLoading,
    };
};

export default useProfileManagement;
