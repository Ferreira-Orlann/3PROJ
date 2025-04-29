import { UUID } from "crypto";

export type Channel = {
    id: UUID;
    name: string;
    isPublic: boolean;
};

export type Workspace = {
    workspaceId: UUID;
    name: string;
    description: string;
    is_public: boolean;
    memberCount: number;
    owner: string;
    createdAt: string;
};

export interface CreateWorkspaceForm {
    name: string;
    description: string;
    is_public: boolean;
}

export interface HomeScreenState {
    searchQuery: string;
    showCreateWorkspaceModal: boolean;
    newWorkspaceForm: CreateWorkspaceForm;
    workspaces: Workspace[];
    isLoading: boolean;
    error: string | null;
}
