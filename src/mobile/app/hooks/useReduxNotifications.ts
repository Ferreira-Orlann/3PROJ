import { useState, useCallback, useEffect } from "react";
import { UUID } from "crypto";
import { useAppSelector, useAppDispatch } from "./useAppRedux";
import { Notification } from "../services/notifications";
import websocketService from "../services/websocket/websocket.service";

// Import API hooks from Redux
import { 
  useGetUserNotificationsQuery,
  useGetUnreadNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} from "../store/api/notificationsApi";

// Tentative d'importer useAuth s'il existe
let useAuth: any = null;
try {
  const authModule = require("../context/AuthContext");
  if (authModule && typeof authModule.useAuth === "function") {
    useAuth = authModule.useAuth;
  }
} catch (error) {
  console.log("AuthContext non disponible, utilisation du mode alternatif");
}

/**
 * Hook pour gérer les notifications avec Redux
 */
export const useReduxNotifications = (currentUserUuid?: UUID) => {
  // Utiliser useAuth si disponible, sinon utiliser currentUserUuid fourni en paramètre
  let userUuid = currentUserUuid as UUID | undefined;
  
  if (useAuth) {
    try {
      const authContext = useAuth();
      userUuid = authContext?.user?.uuid || userUuid;
    } catch (error) {
      console.log("Erreur lors de l'utilisation de useAuth:", error);
    }
  }

  // État pour la connexion WebSocket
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);

  // Utiliser les hooks Redux pour récupérer les notifications
  const { 
    data: allNotifications = [], 
    isLoading: isAllNotificationsLoading,
    error: allNotificationsError,
    refetch: refetchAllNotifications
  } = useGetUserNotificationsQuery(
    userUuid as UUID,
    { skip: !userUuid }
  );

  const { 
    data: unreadNotifications = [], 
    isLoading: isUnreadNotificationsLoading,
    error: unreadNotificationsError,
    refetch: refetchUnreadNotifications
  } = useGetUnreadNotificationsQuery(
    userUuid as UUID,
    { skip: !userUuid }
  );

  // Mutations Redux
  const [markAsRead, { isLoading: isMarkingAsRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation();
  const [deleteNotification, { isLoading: isDeletingNotification }] = useDeleteNotificationMutation();

  // État combiné pour le chargement
  const isLoading = isAllNotificationsLoading || isUnreadNotificationsLoading;
  
  // État combiné pour les erreurs
  const error = allNotificationsError || unreadNotificationsError
    ? typeof allNotificationsError === 'string'
      ? allNotificationsError
      : typeof unreadNotificationsError === 'string'
        ? unreadNotificationsError
        : 'Erreur lors du chargement des notifications'
    : null;

  // Vérifier l'état de la connexion WebSocket périodiquement
  useEffect(() => {
    // Vérifier l'état initial de la connexion
    const initialConnected = websocketService.isConnected();
    setIsWebSocketConnected(initialConnected);

    // Vérifier périodiquement l'état de la connexion
    const checkInterval = setInterval(() => {
      const connected = websocketService.isConnected();
      if (connected !== isWebSocketConnected) {
        setIsWebSocketConnected(connected);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [isWebSocketConnected]);

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = useCallback(() => {
    if (userUuid) {
      refetchAllNotifications();
      refetchUnreadNotifications();
    }
  }, [userUuid, refetchAllNotifications, refetchUnreadNotifications]);

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = useCallback(async (notificationUuid: UUID) => {
    if (!userUuid) {
      console.error("useReduxNotifications - markNotificationAsRead - UUID de l'utilisateur manquant");
      return;
    }

    try {
      await markAsRead({
        userUuid,
        notificationUuid,
      }).unwrap();

      // Rafraîchir les notifications
      refreshNotifications();
    } catch (error) {
      console.error("useReduxNotifications - markNotificationAsRead - Erreur:", error);
    }
  }, [userUuid, markAsRead, refreshNotifications]);

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!userUuid) {
      console.error("useReduxNotifications - markAllNotificationsAsRead - UUID de l'utilisateur manquant");
      return;
    }

    try {
      await markAllAsRead(userUuid).unwrap();

      // Rafraîchir les notifications
      refreshNotifications();
    } catch (error) {
      console.error("useReduxNotifications - markAllNotificationsAsRead - Erreur:", error);
    }
  }, [userUuid, markAllAsRead, refreshNotifications]);

  // Fonction pour supprimer une notification
  const deleteNotificationById = useCallback(async (notificationUuid: UUID) => {
    if (!userUuid) {
      console.error("useReduxNotifications - deleteNotificationById - UUID de l'utilisateur manquant");
      return;
    }

    try {
      await deleteNotification({
        userUuid,
        notificationUuid,
      }).unwrap();

      // Rafraîchir les notifications
      refreshNotifications();
    } catch (error) {
      console.error("useReduxNotifications - deleteNotificationById - Erreur:", error);
    }
  }, [userUuid, deleteNotification, refreshNotifications]);

  // Configurer les écouteurs WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    if (!isWebSocketConnected || !userUuid) return;

    const handleNewNotification = () => {
      console.log("useReduxNotifications - Nouvelle notification reçue via WebSocket");
      refreshNotifications();
    };

    const handleNotificationUpdated = () => {
      console.log("useReduxNotifications - Notification mise à jour via WebSocket");
      refreshNotifications();
    };

    const handleNotificationDeleted = () => {
      console.log("useReduxNotifications - Notification supprimée via WebSocket");
      refreshNotifications();
    };

    // S'abonner aux événements WebSocket
    websocketService.on('notification_created', handleNewNotification);
    websocketService.on('notification_updated', handleNotificationUpdated);
    websocketService.on('notification_deleted', handleNotificationDeleted);

    // Nettoyer les abonnements lors du démontage
    return () => {
      websocketService.off('notification_created', handleNewNotification);
      websocketService.off('notification_updated', handleNotificationUpdated);
      websocketService.off('notification_deleted', handleNotificationDeleted);
    };
  }, [isWebSocketConnected, userUuid, refreshNotifications]);

  return {
    notifications: allNotifications,
    unreadNotifications,
    isLoading,
    error,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    deleteNotification: deleteNotificationById,
    refreshNotifications,
    unreadCount: unreadNotifications.length,
  };
};

export default useReduxNotifications;
