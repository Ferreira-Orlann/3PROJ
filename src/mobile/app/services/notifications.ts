// Types pour l'écran de notifications
export type Notification = {
  id: string;
  type: 'mention' | 'message' | 'invitation' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  sourceId?: string; // ID du canal, de l'espace ou de l'utilisateur source
  sourceType?: 'channel' | 'workspace' | 'directMessage';
  workspaceId?: string; // ID de l'espace de travail si applicable
  channelId?: string; // ID du canal si applicable
  userId?: string; // ID de l'utilisateur si applicable (pour les mentions ou messages directs)
  mentionedUsers?: string[]; // Liste des utilisateurs mentionnés
};

// Type pour les préférences de notification
export type NotificationPreferences = {
  enablePush: boolean;
  enableEmail: boolean;
  muteAll: boolean;
  channels: {
    [channelId: string]: {
      muted: boolean;
      mentions: boolean;
      messages: boolean;
    };
  };
  workspaces: {
    [workspaceId: string]: {
      muted: boolean;
      mentions: boolean;
      messages: boolean;
    };
  };
};


