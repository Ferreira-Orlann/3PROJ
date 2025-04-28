// Types pour l'écran de profil

// Type pour les informations utilisateur
export type UserProfile = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  status: 'En ligne' | 'Absent' | 'Ne pas déranger' | 'Hors ligne';
};

// Type pour les préférences utilisateur
export type UserPreferences = {
  isDarkTheme: boolean;
};

// Type pour les connexions OAuth
export type OAuthConnections = {
  google: boolean;
  github: boolean;
  microsoft: boolean;
};

// Type pour les informations de changement de mot de passe
export type PasswordChangeInfo = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
