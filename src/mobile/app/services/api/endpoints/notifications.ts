import apiClient from "../client";
import { UUID } from "crypto";
import { Notification } from '../../notifications';

// Conversion du format backend vers le format frontend
const mapBackendNotification = (backendNotif: any): Notification => {
  // Déterminer le type de notification
  let type: 'mention' | 'message' | 'invitation' | 'system' = 'system';
  
  if (backendNotif.type === 'MESSAGE_RECEIVED') {
    type = 'message';
  } else if (backendNotif.type === 'REACTION_RECEIVED') {
    type = 'message';
  } else if (backendNotif.type === 'WORKSPACE_INVITATION') {
    type = 'invitation';
  } else if (backendNotif.type === 'CHANNEL_REACTION') {
    type = 'mention';
  }

  // Déterminer le type de source
  let sourceType: 'channel' | 'workspace' | 'directMessage' | undefined;
  if (backendNotif.channel) {
    sourceType = 'channel';
  } else if (backendNotif.workspace) {
    sourceType = 'workspace';
  } else if (backendNotif.message && !backendNotif.channel) {
    sourceType = 'directMessage';
  }

  // Créer le titre et la description en fonction du type
  let title = 'Notification';
  let description = backendNotif.content || '';

  if (backendNotif.type === 'MESSAGE_RECEIVED') {
    title = 'Nouveau message';
    description = backendNotif.sender 
      ? `${backendNotif.sender.username} a envoyé un message` 
      : 'Vous avez reçu un nouveau message';
    
    if (backendNotif.channel) {
      description += ` dans ${backendNotif.channel.name}`;
    }
  } else if (backendNotif.type === 'REACTION_RECEIVED') {
    title = 'Nouvelle réaction';
    description = backendNotif.sender 
      ? `${backendNotif.sender.username} a réagi à votre message` 
      : 'Quelqu\'un a réagi à votre message';
  } else if (backendNotif.type === 'WORKSPACE_INVITATION') {
    title = 'Invitation à un espace de travail';
    description = backendNotif.workspace 
      ? `Vous avez été invité à rejoindre ${backendNotif.workspace.name}` 
      : 'Vous avez reçu une invitation à un espace de travail';
  }

  // Formater la date
  const timestamp = new Date(backendNotif.created_at);
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  let formattedTime = '';
  if (diffMins < 1) {
    formattedTime = 'À l\'instant';
  } else if (diffMins < 60) {
    formattedTime = `Il y a ${diffMins} min`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    formattedTime = `Il y a ${hours} h`;
  } else {
    const days = Math.floor(diffMins / 1440);
    formattedTime = `Il y a ${days} j`;
  }

  return {
    uuid: backendNotif.uuid,
    type,
    title,
    description,
    timestamp: formattedTime,
    read: backendNotif.read,
    sourceType,
    workspaceId: backendNotif.workspace?.uuid,
    channelId: backendNotif.channel?.uuid,
    userId: backendNotif.sender?.uuid,
    mentionedUsers: []
  };
};

export const Notifications = {
  // Récupérer toutes les notifications d'un utilisateur
  getUserNotifications: async (userUuid: UUID): Promise<Notification[]> => {
    try {
      const response = await apiClient.get(`/notifications/users/${userUuid}/notifications`);
      console.log("response.data", response.data);
      console.log("response.datass", response.data.map(mapBackendNotification));
      return response.data.map(mapBackendNotification);
      

    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  // Récupérer les notifications non lues d'un utilisateur
  getUnreadNotifications: async (userUuid: UUID): Promise<Notification[]> => {
    try {
      const response = await apiClient.get(`/notifications/users/${userUuid}/notifications/unread`);
      return response.data.map(mapBackendNotification);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  markAsRead: async (userUuid: UUID, notificationUuid: UUID): Promise<void> => {
    try {
      await apiClient.put(`/notifications/users/${userUuid}/notifications/${notificationUuid}/read`);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (userUuid: UUID): Promise<void> => {
    try {
      await apiClient.put(`/notifications/users/${userUuid}/notifications/read-all`);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  // Supprimer une notification
  deleteNotification: async (userUuid: UUID, notificationUuid: UUID): Promise<void> => {
    try {
      await apiClient.delete(`/notifications/users/${userUuid}/notifications/${notificationUuid}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }
};
