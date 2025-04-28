import { useState, useCallback } from 'react';
import { UUID } from 'crypto';
import { Platform, Alert } from 'react-native';
import attachmentService, { Attachment } from '../services/api/endpoints/attachments';

// Import dynamique des modules Expo pour éviter les erreurs si les modules ne sont pas disponibles
let DocumentPicker: any;
let FileSystem: any;
let Sharing: any;

// Chargement conditionnel des modules Expo
try {
  DocumentPicker = require('expo-document-picker');
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('Certains modules Expo n\'ont pas pu être chargés:', error);
}

/**
 * Hook pour gérer les pièces jointes des messages
 */
export const useAttachments = (
  workspaceUuid: UUID | null,
  channelUuid: UUID | null,
  messageUuid: UUID | null,
  userUuid?: UUID
) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  /**
   * Sélectionne un fichier à partir de l'appareil
   */
  const pickFile = useCallback(async () => {
    try {
      if (!DocumentPicker) {
        Alert.alert('Erreur', 'La sélection de fichiers n\'est pas disponible');
        return null;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const file = result.assets[0];
      return {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
        size: file.size,
      };
    } catch (err) {
      console.error('Erreur lors de la sélection du fichier:', err);
      setError('Impossible de sélectionner le fichier. Veuillez réessayer.');
      return null;
    }
  }, []);

  /**
   * Télécharge un fichier sur le serveur
   */
  const uploadFile = useCallback(async (fileUri: string, fileName: string, fileType: string) => {
    if (!fileUri) return null;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Création d'un objet FormData pour l'upload
      const formData = new FormData();
      
      // @ts-ignore - Le type File n'est pas exactement compatible avec ReactNative
      formData.append('file', {
        uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
        name: fileName,
        type: fileType,
      });

      // Simuler la progression (dans une vraie implémentation, on utiliserait axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.05;
          return newProgress > 0.95 ? 0.95 : newProgress;
        });
      }, 100);

      // Upload du fichier
      const fileUuid = await attachmentService.uploadFile(formData as any);
      
      clearInterval(progressInterval);
      setProgress(1);

      return fileUuid;
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      setError('Impossible de télécharger le fichier. Veuillez réessayer.');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Télécharge et attache un fichier à un message
   */
  const uploadAndAttachFile = useCallback(async (
    fileUri: string,
    fileName: string,
    fileType: string,
    messageUuid: UUID
  ) => {
    if (!fileUri || !messageUuid) return null;

    setUploading(true);
    setError(null);

    try {
      const fileUuid = await uploadFile(fileUri, fileName, fileType);
      
      if (!fileUuid) {
        throw new Error('Échec du téléchargement du fichier');
      }

      // Attacher le fichier au message
      if (workspaceUuid && channelUuid) {
        await attachmentService.attachFileToMessage(
          workspaceUuid,
          channelUuid,
          messageUuid,
          fileUuid
        );
      } else if (userUuid && channelUuid) {
        await attachmentService.attachFileToDirectMessage(
          userUuid,
          channelUuid,
          messageUuid,
          fileUuid
        );
      } else {
        throw new Error('Soit workspaceUuid soit userUuid doit être fourni avec channelUuid');
      }

      // Construire l'objet Attachment
      const attachment: Attachment = {
        uuid: fileUuid,
        filename: fileName,
        mimetype: fileType,
        size: 0, // La taille réelle serait récupérée du serveur
        url: attachmentService.getFileUrl(fileUuid)
      };

      // Ajouter la pièce jointe à la liste
      setAttachments(prev => [...prev, attachment]);

      return attachment;
    } catch (err) {
      console.error('Erreur lors de l\'upload et l\'attachement du fichier:', err);
      setError('Impossible d\'attacher le fichier au message. Veuillez réessayer.');
      return null;
    } finally {
      setUploading(false);
    }
  }, [workspaceUuid, userUuid, channelUuid, uploadFile]);

  /**
   * Télécharge un fichier depuis le serveur
   */
  const downloadFile = useCallback(async (fileUuid: UUID, filename: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!FileSystem || !Sharing) {
        Alert.alert('Erreur', 'Le téléchargement de fichiers n\'est pas disponible');
        return null;
      }

      // Construire l'URL du fichier
      const fileUrl = attachmentService.getFileUrl(fileUuid);
      
      // Télécharger le fichier dans le répertoire temporaire
      const fileUri = FileSystem.documentDirectory + filename;
      const downloadResult = await FileSystem.downloadAsync(fileUrl, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error(`Échec du téléchargement: ${downloadResult.status}`);
      }

      // Partager le fichier
      await Sharing.shareAsync(fileUri);

      return fileUri;
    } catch (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      setError('Impossible de télécharger le fichier. Veuillez réessayer.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime une pièce jointe d'un message
   */
  const removeAttachment = useCallback(async (attachmentUuid: UUID) => {
    if (!messageUuid || !channelUuid) return false;

    setError(null);

    try {
      await attachmentService.removeAttachment(
        workspaceUuid,
        userUuid || null,
        channelUuid,
        messageUuid,
        attachmentUuid
      );

      // Supprimer la pièce jointe de la liste
      setAttachments(prev => prev.filter(att => att.uuid !== attachmentUuid));

      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la pièce jointe:', err);
      setError('Impossible de supprimer la pièce jointe. Veuillez réessayer.');
      return false;
    }
  }, [workspaceUuid, userUuid, channelUuid, messageUuid]);

  /**
   * Récupère l'icône appropriée pour un type de fichier
   */
  const getFileIcon = useCallback((mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else if (mimetype.startsWith('audio/')) {
      return 'music-note';
    } else if (mimetype.includes('pdf')) {
      return 'file-pdf-box';
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      return 'file-word';
    } else if (mimetype.includes('excel') || mimetype.includes('sheet')) {
      return 'file-excel';
    } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
      return 'file-powerpoint';
    } else {
      return 'file';
    }
  }, []);

  return {
    attachments,
    loading,
    uploading,
    progress,
    error,
    pickFile,
    uploadFile,
    uploadAndAttachFile,
    downloadFile,
    removeAttachment,
    getFileIcon
  };
};

export default useAttachments;
