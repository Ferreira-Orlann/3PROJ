import apiClient from '../client';
import { UUID } from 'crypto';

/**
 * Interface pour un membre d'un workspace
 */
export interface Member {
  uuid: UUID;
  joinedAt: string;
  user: {
    uuid: UUID;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    mdp?: string;
    address?: string;
    status?: string;
    avatarUrl?: string;
  };
  workspace: {
    uuid: UUID;
    name: string;
    is_public: boolean;
    owner_uuid: UUID | null;
  };
}

/**
 * Interface pour ajouter un membre à un workspace
 */
export interface AddMemberData {
  userId: UUID;
  role?: 'admin' | 'member';
}

/**
 * Service pour les membres d'un workspace
 */
const memberService = {
  /**
   * Récupérer tous les membres d'un workspace
   */
  getWorkspaceMembers: async (workspaceId: UUID): Promise<Member[]> => {
    const response = await apiClient.get<Member[]>(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  /**
   * Ajouter un membre à un workspace
   */
  addMember: async (workspaceId: UUID, memberData: AddMemberData): Promise<Member> => {
    const response = await apiClient.post<Member>(`/workspaces/${workspaceId}/members`, memberData);
    return response.data;
  },

  /**
   * Supprimer un membre d'un workspace
   */
  removeMember: async (workspaceId: UUID, memberId: UUID): Promise<void> => {
    await apiClient.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  },

  /**
   * Mettre à jour le rôle d'un membre
   */
  updateMemberRole: async (workspaceId: UUID, memberId: UUID, role: 'admin' | 'member'): Promise<Member> => {
    const response = await apiClient.patch<Member>(`/workspaces/${workspaceId}/members/${memberId}`, { role });
    return response.data;
  }
};

export default memberService;
