import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { Notifications } from "../services/api/endpoints/notifications";
import { Notification, NotificationPreferences } from "../services/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { Socket } from "socket.io-client";
import { UUID } from "crypto";

// Hook personnalisé pour la gestion des notifications avec l'API
const useNotificationsApi = (socket?: Socket | null) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enablePush: true,
    enableEmail: false,
    muteAll: false,
    channels: {},
    workspaces: {},
  });
  const [showPreferences, setShowPreferences] = useState(false);

  // Charger les préférences au démarrage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPrefs = await AsyncStorage.getItem("notificationPreferences");
        if (savedPrefs) {
          setPreferences(JSON.parse(savedPrefs));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des préférences:", error);
      }
    };

    loadPreferences();
  }, []);

  // Charger les notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.uuid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await Notifications.getUserNotifications(user.uuid as UUID);
      setNotifications(data);
    } catch (err) {
      console.error("Erreur lors du chargement des notifications:", err);
      setError("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }, [user?.uuid]);

  // Charger les notifications au démarrage et quand l'utilisateur change
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Écouter les événements de notification via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      console.log("Nouvelle notification reçue via WebSocket:", data);
      if (data.notification) {
        // Vérifier si la notification existe déjà pour éviter les doublons
        setNotifications(prev => {
          // Si la notification existe déjà, ne pas l'ajouter à nouveau
          const exists = prev.some(notif => notif.uuid === data.notification.uuid);
          if (exists) {
            // Mettre à jour la notification existante si nécessaire
            return prev.map(notif => 
              notif.uuid === data.notification.uuid ? { ...data.notification } : notif
            );
          }
          // Sinon, ajouter la nouvelle notification au début
          return [data.notification, ...prev];
        });
      }
    };

    // Écouter les différents événements de notification
    socket.on("notification", handleNewNotification);
    socket.on("notification.created", handleNewNotification);
    
    // Informer le serveur que l'utilisateur est sur la page de notifications
    // pour recevoir les mises à jour en temps réel
    if (user?.uuid) {
      socket.emit("notifications.viewing", { userId: user.uuid });
    }

    return () => {
      socket.off("notification", handleNewNotification);
      socket.off("notification.created", handleNewNotification);
    };
  }, [socket, user?.uuid]);

  // Marquer une notification comme lue
  const markAsRead = async (id: UUID) => {
    if (!user?.uuid) return;

    try {
      await Notifications.markAsRead(user.uuid as UUID, id as UUID);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.uuid === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
      Alert.alert(
        "Erreur",
        "Impossible de marquer la notification comme lue"
      );
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user?.uuid) return;

    try {
      await Notifications.markAllAsRead(user.uuid as UUID);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, read: true }))
      );
      Alert.alert(
        "Succès",
        "Toutes les notifications ont été marquées comme lues"
      );
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
      Alert.alert(
        "Erreur",
        "Impossible de marquer toutes les notifications comme lues"
      );
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: UUID) => {
    if (!user?.uuid) return;

    try {
      await Notifications.deleteNotification(user.uuid as UUID, id as UUID);
      setNotifications((prev) => prev.filter((notif) => notif.uuid !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      Alert.alert(
        "Erreur",
        "Impossible de supprimer la notification"
      );
    }
  };

  // Sauvegarder les préférences
  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem(
        "notificationPreferences",
        JSON.stringify(preferences)
      );
      Alert.alert(
        "Succès",
        "Vos préférences de notification ont été enregistrées"
      );
      setShowPreferences(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des préférences:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la sauvegarde de vos préférences"
      );
    }
  };

  // Obtenir l'icône en fonction du type de notification
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "mention":
        return "at";
      case "message":
        return "comment";
      case "invitation":
        return "user-plus";
      case "system":
        return "info-circle";
      default:
        return "bell";
    }
  };

  return {
    notifications,
    loading,
    error,
    preferences,
    showPreferences,
    setShowPreferences,
    setPreferences,
    savePreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    getIcon,
  };
};

export default useNotificationsApi;
