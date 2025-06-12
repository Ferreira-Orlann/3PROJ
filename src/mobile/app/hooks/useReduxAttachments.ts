import { useCallback } from "react";
import { UUID } from "crypto";
import { useAppSelector, useAppDispatch } from "./useAppRedux";
import { API_BASE_URL } from "../services/api/config";

// Import API hooks from Redux
import {
  useUploadFileMutation,
  useGetFileQuery,
  useAttachFileToMessageMutation,
  useAttachFileToDirectMessageMutation,
  useRemoveAttachmentMutation
} from "../store/api/attachmentsApi";

// Tentative d'importer useAuth s'il existe
let useAuth: any = null;
try {
  const authModule = require("../context/AuthContext");
  if (authModule && typeof authModule.useAuth === "function") {
    useAuth = authModule.useAuth;
  }
} catch (error) {
  console.log("AuthContext non disponible, utilisation du mode alternatif");
}

/**
 * Hook pour gérer les pièces jointes avec Redux
 */
export const useReduxAttachments = () => {
  // Utiliser useAuth si disponible
  let currentUser: { uuid: UUID } | null = null;
  
  if (useAuth) {
    try {
      const authContext = useAuth();
      currentUser = authContext?.user || null;
    } catch (error) {
      console.log("Erreur lors de l'utilisation de useAuth:", error);
    }
  }

  // Mutations Redux
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [attachFileToMessage, { isLoading: isAttachingToMessage }] = useAttachFileToMessageMutation();
  const [attachFileToDirectMessage, { isLoading: isAttachingToDirectMessage }] = useAttachFileToDirectMessageMutation();
  const [removeAttachment, { isLoading: isRemoving }] = useRemoveAttachmentMutation();

  // État combiné pour le chargement
  const isLoading = isUploading || isAttachingToMessage || isAttachingToDirectMessage || isRemoving;

  // Fonction pour télécharger un fichier
  const handleUploadFile = useCallback(async (file: File) => {
    try {
      const fileUuid = await uploadFile(file).unwrap();
      return { success: true, fileUuid };
    } catch (error) {
      console.error("useReduxAttachments - handleUploadFile - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors du téléchargement du fichier' 
      };
    }
  }, [uploadFile]);

  // Fonction pour attacher un fichier à un message
  const handleAttachFileToMessage = useCallback(async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ) => {
    try {
      await attachFileToMessage({
        workspaceUuid,
        channelUuid,
        messageUuid,
        fileUuid,
      }).unwrap();
      
      return { success: true };
    } catch (error) {
      console.error("useReduxAttachments - handleAttachFileToMessage - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors de l\'attachement du fichier au message' 
      };
    }
  }, [attachFileToMessage]);

  // Fonction pour attacher un fichier à un message privé
  const handleAttachFileToDirectMessage = useCallback(async (
    userUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ) => {
    try {
      await attachFileToDirectMessage({
        userUuid,
        channelUuid,
        messageUuid,
        fileUuid,
      }).unwrap();
      
      return { success: true };
    } catch (error) {
      console.error("useReduxAttachments - handleAttachFileToDirectMessage - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors de l\'attachement du fichier au message privé' 
      };
    }
  }, [attachFileToDirectMessage]);

  // Fonction pour supprimer une pièce jointe
  const handleRemoveAttachment = useCallback(async (
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID,
    fileUuid: UUID
  ) => {
    try {
      await removeAttachment({
        workspaceUuid,
        userUuid,
        channelUuid,
        messageUuid,
        fileUuid,
      }).unwrap();
      
      return { success: true };
    } catch (error) {
      console.error("useReduxAttachments - handleRemoveAttachment - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors de la suppression de la pièce jointe' 
      };
    }
  }, [removeAttachment]);

  // Fonction pour télécharger et attacher un fichier à un message en une seule opération
  const handleUploadAndAttachFile = useCallback(async (
    file: File,
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID
  ) => {
    try {
      // Étape 1: Télécharger le fichier
      const uploadResult = await handleUploadFile(file);
      if (!uploadResult.success || !uploadResult.fileUuid) {
        return { 
          success: false, 
          error: uploadResult.error || 'Échec du téléchargement du fichier' 
        };
      }

      const fileUuid = uploadResult.fileUuid;

      // Étape 2: Attacher le fichier au message
      if (workspaceUuid) {
        const attachResult = await handleAttachFileToMessage(
          workspaceUuid,
          channelUuid,
          messageUuid,
          fileUuid
        );
        
        if (!attachResult.success) {
          return { 
            success: false, 
            error: attachResult.error || 'Échec de l\'attachement du fichier au message' 
          };
        }
      } else if (userUuid) {
        const attachResult = await handleAttachFileToDirectMessage(
          userUuid,
          channelUuid,
          messageUuid,
          fileUuid
        );
        
        if (!attachResult.success) {
          return { 
            success: false, 
            error: attachResult.error || 'Échec de l\'attachement du fichier au message privé' 
          };
        }
      } else {
        return { 
          success: false, 
          error: 'Contexte de message invalide' 
        };
      }

      return { success: true, fileUuid };
    } catch (error) {
      console.error("useReduxAttachments - handleUploadAndAttachFile - Erreur:", error);
      return { 
        success: false, 
        error: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : 'Erreur lors du téléchargement et de l\'attachement du fichier' 
      };
    }
  }, [handleUploadFile, handleAttachFileToMessage, handleAttachFileToDirectMessage]);

  // Fonction pour obtenir l'URL d'un fichier
  const getFileUrl = useCallback((fileUuid: UUID): string => {
    return `${API_BASE_URL}/files/${fileUuid}`;
  }, []);

  return {
    isLoading,
    uploadFile: handleUploadFile,
    attachFileToMessage: handleAttachFileToMessage,
    attachFileToDirectMessage: handleAttachFileToDirectMessage,
    removeAttachment: handleRemoveAttachment,
    uploadAndAttachFile: handleUploadAndAttachFile,
    getFileUrl,
  };
};

export default useReduxAttachments;
