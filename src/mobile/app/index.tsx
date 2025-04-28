import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Si le chargement est en cours, afficher un indicateur de chargement
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9c5fff" />
      </View>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur est connecté, sinon vers la page de connexion
  return user ? <Redirect href="/screens/homeScreen" /> : <Redirect href="/screens/auth/LoginScreen" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1d21',
  },
});
