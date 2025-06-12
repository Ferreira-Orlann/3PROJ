import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme, StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setDarkMode } from '../store/slices/settingsSlice';
import { Theme, DarkTheme, LightTheme } from './theme';

// Créer un contexte pour le thème
export const ThemeContext = createContext<{
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}>({
  theme: DarkTheme,
  isDarkMode: true,
  toggleTheme: () => {},
});

// Hook pour utiliser le thème
export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.settings.darkMode);
  const colorScheme = useColorScheme();

  // Synchroniser avec le thème du système au premier chargement
  useEffect(() => {
    const shouldBeDark = colorScheme === 'dark';
    if (isDarkMode !== shouldBeDark) {
      dispatch(setDarkMode(shouldBeDark));
    }
  }, []);

  // Déterminer le thème actuel
  const theme = isDarkMode ? DarkTheme : LightTheme;

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    dispatch(setDarkMode(!isDarkMode));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
