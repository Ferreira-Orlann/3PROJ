import { UUID } from "crypto";

// Types pour l'écran de notifications
export type Notification = {
    uuid: UUID;
    type: "mention" | "message" | "invitation" | "system";
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    sourceId?: string;
    sourceType?: "channel" | "workspace" | "directMessage";
    workspaceId?: string;
    channelId?: string;
    userId?: string;
    mentionedUsers?: string[];
};

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
