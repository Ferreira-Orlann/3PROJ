// Types pour l'écran de canal

export interface Attachment {
    type: string;
    name: string;
    size: string;
}

export interface Reaction {
    emoji: string;
    count: number;
    users: string[];
}

export interface Message {
    id: string;
    sender: string;
    avatar: string | null;
    content: string;
    timestamp: string;
    reactions: Reaction[];
    attachments: Attachment[];
}

export interface Channel {
    id: string;
    name: string;
    isPublic: boolean;
}

export interface Workspace {
    id: string;
    name: string;
    isPublic: boolean;
    channels: Channel[];
}

export type Workspaces = Record<string, Workspace>;
export type Messages = Record<string, Message[]>;
