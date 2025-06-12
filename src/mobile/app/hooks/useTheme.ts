import { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeProvider';
import { Theme, ThemeType } from '../theme/theme';

/**
 * Hook personnalisé pour gérer le thème de l'application
 * Permet d'accéder au thème actuel et de basculer entre les modes clair et sombre
 */
export const useTheme = () => {
  // Utiliser le contexte de thème qui est fourni par ThemeProvider
  const { theme, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  // Détermine le type de thème actuel
  const themeType: ThemeType = isDarkMode ? 'dark' : 'light';
  
  // Fonction pour définir explicitement un mode
  const setTheme = (darkMode: boolean) => {
    if (darkMode !== isDarkMode) {
      toggleTheme();
    }
  };
  
  return {
    theme,
    isDarkMode,
    themeType,
    toggleTheme,
    setTheme,
  };
};

export default useTheme;
