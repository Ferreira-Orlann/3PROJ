import { Colors } from './colors';

// Types pour les thèmes
export type ThemeType = 'light' | 'dark';

// Interface pour définir la structure des thèmes
export interface Theme {
  // Couleurs principales
  primary: string;
  background: string;
  surface: string;
  card: string;
  
  // Couleurs de texte
  text: {
    primary: string;
    secondary: string;
  };
  
  // Couleurs de bordure
  border: string;
  
  // Couleurs d'état
  error: string;
  success: string;
  warning: string;
  info: string;
  
  // Couleurs diverses
  gray: string;
  black: string;
  white: string;
  
  // Couleurs spécifiques
  bottomBar: string;
  statusColors: {
    online: string;
    away: string;
    offline: string;
  };
  
  // Couleurs d'interface
  input: string;
  modalBackground: string;
  modalOverlay: string;
  headerBackground: string;
  sidebarBackground: string;
}

// Thème sombre (actuel)
export const DarkTheme: Theme = {
  primary: Colors.primary,
  background: Colors.background,
  surface: Colors.surface,
  card: '#2f3136',
  
  text: {
    primary: '#ffffff',
    secondary: '#8e9297',
  },
  
  border: '#2a2d32',
  
  error: Colors.error,
  success: Colors.success,
  warning: Colors.warning,
  info: Colors.info,
  
  gray: Colors.gray,
  black: Colors.black,
  white: Colors.white,
  
  bottomBar: Colors.bottomBar,
  statusColors: {
    online: '#43b581',
    away: '#faa61a',
    offline: '#747f8d',
  },
  
  input: '#40444b',
  modalBackground: '#36393f',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  headerBackground: '#36393f',
  sidebarBackground: '#2f3136',
};

// Thème clair
export const LightTheme: Theme = {
  primary: '#7c4dff', // Version plus foncée du violet pour meilleure lisibilité sur fond clair
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  
  text: {
    primary: '#2e3338',
    secondary: '#6c757d',
  },
  
  border: '#e0e0e0',
  
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  
  gray: '#6c757d',
  black: '#000000',
  white: '#ffffff',
  
  bottomBar: '#ffffff',
  statusColors: {
    online: '#43b581',
    away: '#faa61a',
    offline: '#747f8d',
  },
  
  input: '#f0f2f5',
  modalBackground: '#ffffff',
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  headerBackground: '#ffffff',
  sidebarBackground: '#f0f2f5',
};

// Fonction pour obtenir le thème actuel
export const getTheme = (themeType: ThemeType): Theme => {
  return themeType === 'dark' ? DarkTheme : LightTheme;
};

export default {
  dark: DarkTheme,
  light: LightTheme,
  getTheme,
};
