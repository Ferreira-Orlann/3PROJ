import apiClient from '../client';
import { UUID } from 'crypto';

/**
 * Interface pour une pièce jointe
 */
export interface Attachment {
  uuid: UUID;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
}

/**
 * Interface pour l'upload d'une pièce jointe
 */
export interface AttachmentUploadData {
  file: File;
  messageUuid?: UUID;
}

/**
 * Service pour la gestion des pièces jointes
 */
const attachmentService = {
  /**
   * Télécharge une pièce jointe sur le serveur
   */
  uploadFile: async (file: File): Promise<UUID> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UUID>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Récupère une pièce jointe par son UUID
   */
  getFile: async (fileUuid: UUID): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
      `/files/${fileUuid}`,
      {
        responseType: 'blob'
      }
    );
    return response.data;
  },

  /**
   * Récupère l'URL d'une pièce jointe
   */
  getFileUrl: (fileUuid: UUID): string => {
    return `${apiClient.defaults.baseURL}/files/${fileUuid}`;
  },

  /**
   * Ajoute une pièce jointe à un message dans un canal d'un espace de travail
   */
  attachFileToMessage: async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ): Promise<void> => {
    await apiClient.post(
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
      { fileUuid }
    );
  },

  /**
   * Ajoute une pièce jointe à un message privé
   */
  attachFileToDirectMessage: async (
    userUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ): Promise<void> => {
    await apiClient.post(
      `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments`,
      { fileUuid }
    );
  },

  /**
   * Supprime une pièce jointe d'un message
   */
  removeAttachment: async (
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ): Promise<void> => {
    let url;
    if (workspaceUuid) {
      url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
    } else {
      url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/attachments/${fileUuid}`;
    }
    
    await apiClient.delete(url);
  },

  /**
   * Télécharge et attache un fichier à un message en une seule opération
   */
  uploadAndAttachFile: async (
    file: File,
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID
  ): Promise<UUID> => {
    // Étape 1: Télécharger le fichier
    const fileUuid = await attachmentService.uploadFile(file);
    
    // Étape 2: Attacher le fichier au message
    if (workspaceUuid) {
      await attachmentService.attachFileToMessage(
        workspaceUuid,
        channelUuid,
        messageUuid,
        fileUuid
      );
    } else if (userUuid) {
      await attachmentService.attachFileToDirectMessage(
        userUuid,
        channelUuid,
        messageUuid,
        fileUuid
      );
    }
    
    return fileUuid;
  }
};

export default attachmentService;
