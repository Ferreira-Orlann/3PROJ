import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationPreferences } from '../services/notifications';

// Données de notification par défaut pour le développement
const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'mention',
    title: 'Nouvelle mention',
    description: '@johndoe vous a mentionné dans #general',
    timestamp: 'Il y a 5 min',
    read: false,
    sourceType: 'channel',
    workspaceId: '1',
    channelId: '101',
    userId: 'user1',
    mentionedUsers: ['currentUser'],
  },
  {
    id: '2',
    type: 'message',
    title: 'Nouveau message',
    description: 'Marie a envoyé un message dans Projet A',
    timestamp: 'Il y a 15 min',
    read: false,
    sourceType: 'channel',
    workspaceId: '',
    channelId: '2',
  },
  {
    id: '3',
    type: 'message',
    title: 'Nouveau message direct',
    description: 'Paul vous a envoyé un message',
    timestamp: 'Il y a 30 min',
    read: false,
    sourceType: 'directMessage',
    userId: 'user2',
  },
  {
    id: '4',
    type: 'mention',
    title: 'Nouvelle mention',
    description: '@marie vous a mentionné dans #design',
    timestamp: 'Il y a 45 min',
    read: true,
    sourceType: 'channel',
    workspaceId: '2',
    channelId: '3',
    userId: 'dm3',
    mentionedUsers: ['currentUser', 'user4'],
  },
  {
    id: '5',
    type: 'invitation',
    title: 'Invitation workspace',
    description: 'Vous avez été invité à rejoindre "Team Dev"',
    timestamp: 'Il y a 1h',
    read: true,
    sourceType: 'workspace',
    workspaceId: '3',
  },
];

// Préférences de notification par défaut
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enablePush: true,
  enableEmail: false,
  muteAll: false,
  channels: {
    'channel1': { muted: false, mentions: true, messages: true },
    'channel2': { muted: false, mentions: true, messages: false },
    'channel3': { muted: true, mentions: false, messages: false },
  },
  workspaces: {
    'workspace1': { muted: false, mentions: true, messages: true },
    'workspace2': { muted: false, mentions: true, messages: false },
  },
};

// Hook personnalisé pour la gestion des notifications
const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Charger les préférences au démarrage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem('notificationPreferences');
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Sauvegarder les préférences
  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      Alert.alert('Succès', 'Vos préférences de notification ont été enregistrées');
      setShowPreferences(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde de vos préférences');
    }
  };
  
  // Marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
    Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
  };
  
  // Obtenir l'icône en fonction du type de notification
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return 'at';
      case 'message':
        return 'comment';
      case 'invitation':
        return 'user-plus';
      case 'system':
        return 'info-circle';
      default:
        return 'bell';
    }
  };
  
  return {
    notifications,
    preferences,
    showPreferences,
    setShowPreferences,
    setPreferences,
    savePreferences,
    markAsRead,
    markAllAsRead,
    getIcon
  };
};


export default useNotifications;
