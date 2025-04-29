// Types pour l'écran d'espace de travail
import { UUID } from "crypto";

export interface Channel {
    uuid: UUID;
    name: string;
    is_public: boolean;
    description: string;
    memberCount: number;
}

export interface Member {
    uuid: UUID;
    joinedAt: string;
    user: {
        uuid: UUID;
        username: string;
        firstname: string;
        lastname: string;
        email: string;
        status?: string;
        avatarUrl?: string;
    };
    workspace: {
        uuid: UUID;
        name: string;
        is_public: boolean;
        owner_uuid: UUID | null;
    };
    name?: string;
    username?: string;
    email?: string;
    avatar?: string;
    status?: "online" | "offline" | "away";
    role?: string;
}

export interface Workspace {
    uuid: UUID;
    name: string;
    description: string;
    is_public: boolean;
    memberCount: number;
    owner: string;
    createdAt: string;
    channels: Channel[];
    members: Member[];
}

export type Workspaces = Record<string, Workspace>;

export interface Tab {
    id: string;
    label: string;
    icon: string;
}

export interface NewChannelForm {
    name: string;
    description: string;
    is_public: boolean;
}

export interface SearchState {
    query: string;
    filteredChannels: Channel[];
    filteredMembers: Member[];
}

export interface ModalState {
    showNewChannelModal: boolean;
    showAddMemberModal: boolean;
    showRemoveMemberModal: boolean;
    memberToRemove: Member | null;
}

// Default export for routing purposes
const WorkspaceTypes = {};

export default WorkspaceTypes;
