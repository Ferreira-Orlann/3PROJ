import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { 
  UserProfile, 
  UserPreferences, 
  OAuthConnections, 
  PasswordChangeInfo 
} from '../services/Profile';
import userService, { UpdateUserData } from '../services/api/endpoints/users';

// Hook personnalisé pour la gestion du profil utilisateur
export const useProfileManagement = () => {
  // Obtenir l'utilisateur authentifié depuis le contexte d'authentification
  const { user } = useAuth();
  
  // Informations utilisateur - initialiser avec des valeurs vides
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    status: 'Hors ligne',
  });
  
  // État de chargement pour les données utilisateur
  const [isLoading, setIsLoading] = useState(true);
  
  // Gestion du mot de passe
  const [passwordInfo, setPasswordInfo] = useState<PasswordChangeInfo>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Préférences utilisateur
  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkTheme: true,
  });
  
  // Connexions OAuth
  const [connectedProviders, setConnectedProviders] = useState<OAuthConnections>({
    google: false,
    github: true,
    microsoft: false
  });
  
  // État d'exportation des données
  const [isExporting, setIsExporting] = useState(false);
  
  // Charger les données utilisateur au démarrage
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Charger les préférences de thème (toujours depuis AsyncStorage)
        const themePreference = await AsyncStorage.getItem('themePreference');
        if (themePreference) {
          setPreferences(prev => ({
            ...prev,
            isDarkTheme: themePreference === 'dark'
          }));
        }
        
        // Utiliser l'utilisateur authentifié depuis le contexte d'authentification
        console.log('Utilisation des données utilisateur depuis le contexte d\'authentification:', user);
        const userData = user; // Utiliser l'utilisateur du contexte au lieu d'appeler l'API
        
        if (userData) {
          // Extraire le prénom et le nom à partir du nom d'utilisateur
          // Dans AuthContext, username est au format "prénom nom"
          const nameParts = userData.username ? userData.username.split(' ') : ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          // Convertir les données de l'utilisateur authentifié au format attendu par notre application
          setUserProfile({
            username: userData.username || '',
            firstName: firstName,
            lastName: lastName,
            email: userData.email || '',
            bio: 'Développeur passionné', // Valeur par défaut car bio n'existe pas dans l'API
            // Convertir le statut de l'utilisateur authentifié au format de l'application
            status: userData.status === 'online' ? 'En ligne' : 
                    userData.status === 'away' ? 'Absent' : 'Hors ligne'
          });
          
          console.log('Profil utilisateur mis à jour avec les données de l\'API');
        }
        
        // Charger les connexions OAuth (toujours depuis AsyncStorage)
        const savedConnections = await AsyncStorage.getItem('oauthConnections');
        if (savedConnections) {
          setConnectedProviders(JSON.parse(savedConnections));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        Alert.alert(
          'Erreur',
          'Impossible de charger votre profil. Vérifiez votre connexion internet.'
        );
        
        // En cas d'erreur avec l'API, essayer de charger depuis le stockage local
        try {
          const savedProfile = await AsyncStorage.getItem('userProfile');
          if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
            console.log('Profil utilisateur chargé depuis le stockage local');
          }
        } catch (fallbackError) {
          console.error('Erreur lors du chargement du profil de secours:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Mettre à jour le profil utilisateur
  const updateProfile = (field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Mettre à jour les informations de mot de passe
  const updatePasswordInfo = (field: keyof PasswordChangeInfo, value: string) => {
    setPasswordInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Réinitialiser les informations de mot de passe
  const resetPasswordInfo = () => {
    setPasswordInfo({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  // Valider et changer le mot de passe
  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordInfo;
    
    // Validation des champs
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    
    try {
      // Utiliser le service API pour changer le mot de passe
      await userService.changePassword(currentPassword, newPassword);
      
      Alert.alert('Succès', 'Votre mot de passe a été modifié avec succès');
      setShowPasswordModal(false);
      resetPasswordInfo();
      return true;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de modifier le mot de passe. Vérifiez que votre mot de passe actuel est correct.');
      return false;
    }
  };
  
  // Sauvegarder les modifications du profil
  const saveProfile = async () => {
    try {
      // Préparer les données pour l'API
      const userData: UpdateUserData = {
        username: userProfile.username,
        fullName: `${userProfile.firstName} ${userProfile.lastName}`,
        email: userProfile.email,
        status: userProfile.status === 'En ligne' ? 'en ligne' : 
                userProfile.status === 'Absent' ? 'absent' : 'hors ligne'
      };
      
      console.log('Mise à jour du profil utilisateur via l\'API...', userData);
      
      // Mettre à jour le profil utilisateur via l'API
      const updatedUser = await userService.updateProfile(userData);
      console.log('Profil utilisateur mis à jour avec succès:', updatedUser);
      
      // Sauvegarder les préférences localement (ces données ne sont pas gérées par l'API)
      await AsyncStorage.setItem('themePreference', preferences.isDarkTheme ? 'dark' : 'light');
      await AsyncStorage.setItem('oauthConnections', JSON.stringify(connectedProviders));
      
      // Sauvegarder également une copie locale du profil pour le mode hors ligne
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      Alert.alert('Succès', 'Vos informations ont été mises à jour avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la mise à jour de votre profil');
    }
  };
  
  // Gérer les connexions OAuth
  const toggleOAuthConnection = async (provider: keyof OAuthConnections) => {
    if (connectedProviders[provider]) {
      // Déconnexion
      setConnectedProviders({
        ...connectedProviders,
        [provider]: false
      });
    } else {
      // Connexion - ouvrir le flux OAuth
      let authUrl = '';
      
      switch (provider) {
        case 'google':
          authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
          break;
        case 'github':
          authUrl = 'https://github.com/login/oauth/authorize';
          break;
        case 'microsoft':
          authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
          break;
      }
      
      if (authUrl) {
        try {
          await WebBrowser.openBrowserAsync(authUrl);
          // Dans une application réelle, nous gérerions le callback OAuth ici
          // Pour le moment, nous simulons simplement un succès
          setConnectedProviders({
            ...connectedProviders,
            [provider]: true
          });
        } catch (error) {
          console.error(`Erreur lors de la connexion à ${provider}:`, error);
          Alert.alert('Erreur', `Une erreur est survenue lors de la connexion à ${provider}`);
        }
      }
    }
  };
  
  // Exporter les données utilisateur
  const exportUserData = async () => {
    try {
      setIsExporting(true);
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Créer un objet JSON avec les données utilisateur
      const userData = {
        ...userProfile,
        preferences,
        connectedProviders,
        exportDate: new Date().toISOString()
      };
      
      // Dans une implémentation réelle, nous utiliserions FileSystem et Sharing
      // Pour le moment, nous sauvegardons simplement dans AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      Alert.alert(
        'Données exportées', 
        'Dans une implémentation réelle, un fichier JSON serait généré et partagé. ' +
        'Pour installer les dépendances nécessaires, exécutez: pnpm add expo-file-system expo-sharing expo-secure-store'
      );
      
      setIsExporting(false);
    } catch (error) {
      setIsExporting(false);
      console.error('Erreur lors de l\'exportation des données:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'exportation de vos données');
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
    isLoading
  };
};

export default useProfileManagement;

