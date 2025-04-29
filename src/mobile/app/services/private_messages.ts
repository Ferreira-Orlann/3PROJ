// Types pour l'écran de messages directs

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
    content: string;
    timestamp: string;
    reactions: Reaction[];
    attachments: Attachment[];
    avatar: string | null;
}

export interface User {
    id: string;
    name: string;
    status: "en ligne" | "absent" | "hors ligne";
    avatar: string | null;
}

// Type pour les conversations
export type Conversations = Record<string, Message[]>;

// Type pour les utilisateurs
export type Users = Record<string, User>;
