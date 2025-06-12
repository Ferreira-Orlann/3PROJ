import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
    UserProfile,
    UserPreferences,
    OAuthConnections,
    PasswordChangeInfo,
} from "../services/Profile";

// Import Redux hooks
import useReduxUsers from "./useReduxUsers";
import { 
    useGetCurrentUserQuery, 
    useUpdateProfileMutation, 
    useChangePasswordMutation,
} from "../store/api/usersApi";

export const useReduxProfile = () => {
    const { user, token } = useAuth();
    
    // Utiliser les hooks Redux pour les opérations utilisateur
    const { data: currentUser, isLoading: isUserLoading } = useGetCurrentUserQuery();
    const [updateUser, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [changeUserPassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

    // État local pour le profil utilisateur
    const [userProfile, setUserProfile] = useState<UserProfile>({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        status: "Hors ligne",
    });

    // État pour la gestion du mot de passe
    const [passwordInfo, setPasswordInfo] = useState<PasswordChangeInfo>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // États pour les préférences et connexions OAuth
    const [preferences, setPreferences] = useState<UserPreferences>({
        isDarkTheme: true,
    });
    const [connectedProviders, setConnectedProviders] = useState<OAuthConnections>({
        google: false,
        github: true,
        microsoft: false,
    });

    // Charger les données utilisateur depuis le hook Redux
    useEffect(() => {
        console.log("useReduxProfile - currentUser:", user);
        if (user) {
            setUserProfile({
                username: user.username || "",
                firstName: user.firstname || "",
                lastName: user.lastname || "",
                email: user.email || "",
                bio: user.bio || "",
                status: user.status || "Hors ligne",
            });
        }
    }, [user]);

    // Charger les préférences depuis le stockage local
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const themePreference = await AsyncStorage.getItem("theme_preference");
                if (themePreference) {
                    setPreferences((prev) => ({
                        ...prev,
                        isDarkTheme: themePreference === "dark",
                    }));
                }
            } catch (error) {
                console.error("Erreur lors du chargement des préférences:", error);
            }
        };

        loadPreferences();
    }, []);

    // Mettre à jour les préférences
    const updatePreferences = useCallback(async (newPreferences: UserPreferences) => {
        try {
            setPreferences(newPreferences);
            await AsyncStorage.setItem(
                "theme_preference",
                newPreferences.isDarkTheme ? "dark" : "light"
            );
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des préférences:", error);
            Alert.alert("Erreur", "Impossible de sauvegarder vos préférences.");
        }
    }, []);

    // Mettre à jour le profil utilisateur localement
    const updateProfile = useCallback((field: keyof UserProfile, value: string) => {
        setUserProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Sauvegarder le profil utilisateur
    const saveProfile = useCallback(async () => {
        try {
            const userData = {
                username: userProfile.username,
                fullName: userProfile.firstName,
                email: userProfile.email,
                bio: userProfile.bio,
                status: userProfile.status,
            };

            await updateUser(userData).unwrap();
            Alert.alert("Succès", "Profil mis à jour avec succès");
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil:", error);
            Alert.alert("Erreur", "Impossible de mettre à jour votre profil.");
        }
    }, [userProfile, updateUser]);

    // Gérer le changement de mot de passe
    const updatePasswordInfo = useCallback((field: keyof PasswordChangeInfo, value: string) => {
        setPasswordInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    // Réinitialiser les informations de mot de passe
    const resetPasswordInfo = useCallback(() => {
        setPasswordInfo({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }, []);

    // Changer le mot de passe
    const changePassword = useCallback(async () => {
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            await changeUserPassword({
                currentPassword: passwordInfo.currentPassword,
                newPassword: passwordInfo.newPassword,
            }).unwrap();

            Alert.alert("Succès", "Mot de passe changé avec succès");
            setShowPasswordModal(false);
            resetPasswordInfo();
        } catch (error) {
            console.error("Erreur lors du changement de mot de passe:", error);
            Alert.alert("Erreur", "Impossible de changer votre mot de passe.");
        }
    }, [passwordInfo, changeUserPassword, resetPasswordInfo]);

    // Gérer les connexions OAuth
    const toggleOAuthConnection = useCallback((provider: keyof OAuthConnections) => {
        // Simuler la connexion/déconnexion d'un fournisseur OAuth
        setConnectedProviders((prev) => ({
            ...prev,
            [provider]: !prev[provider],
        }));

        if (!connectedProviders[provider]) {
            // Si on se connecte, ouvrir la page d'authentification
            WebBrowser.openBrowserAsync(`https://example.com/auth/${provider}`);
        } else {
            // Si on se déconnecte, afficher une confirmation
            Alert.alert(
                "Déconnexion",
                `Vous avez été déconnecté de ${provider}.`
            );
        }
    }, [connectedProviders]);

    // État de chargement global
    const isLoading = isUserLoading || isUpdating || isChangingPassword;

    return {
        userProfile,
        updateProfile,
        preferences,
        setPreferences: updatePreferences,
        connectedProviders,
        toggleOAuthConnection,
        passwordInfo,
        updatePasswordInfo,
        showPasswordModal,
        setShowPasswordModal,
        changePassword,
        resetPasswordInfo,
        saveProfile,
        isLoading,
    };
};

export default useReduxProfile;
