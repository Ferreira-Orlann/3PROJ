import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { UUID } from 'crypto';
import { useAuth } from '../../context/AuthContext';
import ChatContainer from '../../components/chat/ChatContainer';
import userService, { User } from '../../services/api/endpoints/users';
import { Colors } from '../../theme/colors';

export default function DirectMessageScreen() {
  const { userId } = useLocalSearchParams();
  const auth = useAuth();
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipientData = async () => {
      if (!userId) {
        setError("ID utilisateur manquant");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await userService.getUserById(userId as UUID);
        setRecipient(userData);
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des données utilisateur:", err);
        setError("Impossible de charger les informations de l'utilisateur");
        setIsLoading(false);
      }
    };

    fetchRecipientData();
  }, [userId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
    );
  }

  if (error || !recipient) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Utilisateur non trouvé"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Conversation avec {recipient.username}
        </Text>
        <View style={styles.statusIndicator}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: recipient.status === "en ligne" ? "#43b581" : "#faa61a" }
            ]} 
          />
          <Text style={styles.statusText}>{recipient.status}</Text>
        </View>
      </View>
      
      {auth.user && (
        <ChatContainer
          userUuid={auth.user.uuid as UUID}
          recipientUuid={recipient.id as UUID}
          isDirectMessage={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.dark,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.text.primary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
});
