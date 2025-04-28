import apiClient from '../client';
import { UUID } from 'crypto';

export interface Workspace {
  workspaceId: UUID;
  uuid?: UUID;  
  name: string;
  description: string;
  is_public: boolean;
  memberCount: number;
  owner: string;
  createdAt: string | Date; 
}

export interface CreateWorkspaceData {
  name: string;
  description: string;
  is_public: boolean;
  owner_uuid: UUID;
}

export interface AddMemberWorkspaceData {
  user_uuid: UUID;
  
}

const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await apiClient.get<Workspace[]>('/workspaces');
    console.log('apiWorkspaces', response.data);
    return response.data;
  },

  getWorkspaceByUuid: async (uuid: UUID): Promise<Workspace> => {
    console.log('getWorkspaceByUuid - Demande de workspace avec uuid:', uuid);
    console.log('getWorkspaceByUuid - URL de la requête:', `/workspaces/${uuid}`);
    try {
      const response = await apiClient.get<Workspace>(`/workspaces/${uuid}`);
      console.log('getWorkspaceByUuid - Réponse reçue:', response.data);
      return response.data;
    } catch (error) {
      console.error('getWorkspaceByUuid - Erreur lors de la récupération:', error);
      throw error;
    }
  },

  createWorkspace: async (workspaceData: CreateWorkspaceData): Promise<Workspace> => {
    console.log('createWorkspace - Data sent to API:', JSON.stringify(workspaceData));
    const response = await apiClient.post<Workspace>('/workspaces', workspaceData);
    console.log('createWorkspace - Response from API:', JSON.stringify(response.data));
    return response.data;
  },

  updateWorkspace: async (uuid: UUID, workspaceData: Partial<CreateWorkspaceData>): Promise<Workspace> => {
    const response = await apiClient.put<Workspace>(`/workspaces/${uuid}`, workspaceData);
    return response.data;
  },
  
  deleteWorkspace: async (uuid: UUID): Promise<void> => {
    await apiClient.delete(`/workspaces/${uuid}`);
  },

  joinWorkspace: async (uuid: UUID, memberData: AddMemberWorkspaceData): Promise<void> => {
    await apiClient.post(`/workspaces/${uuid}/members`, memberData);
  },


  leaveWorkspace: async (uuid: UUID): Promise<void> => {
    await apiClient.delete(`/workspaces/${uuid}/members`);
  },
};

export default workspaceService;
