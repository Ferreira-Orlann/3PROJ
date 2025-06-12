import { useState, useCallback, useEffect } from "react";
import { UUID } from "crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSelector, useAppDispatch } from "./useAppRedux";
import websocketService from "../services/websocket/websocket.service";

// Import API hooks from Redux
import { 
  useGetMessagesQuery,
  useGetDirectMessagesQuery,
  useSendWorkspaceMessageMutation,
  useSendDirectMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation
} from "../store/api/messagesApi";

import {
  useAddReactionMutation,
  useAddDirectMessageReactionMutation,
  useRemoveReactionMutation,
  useRemoveDirectMessageReactionMutation,
} from "../store/api/reactionsApi";

let useAuth: any = null;
try {
  const authModule = require("../context/AuthContext");
  if (authModule && typeof authModule.useAuth === "function") {
    useAuth = authModule.useAuth;
  }
} catch (error) {
  console.log("AuthContext non disponible, utilisation du mode alternatif");
}

const WS_EVENTS = {
  MESSAGE_CREATED: "message_sent",
  MESSAGE_UPDATED: "message_updated",
  MESSAGE_DELETED: "message_removed",
  REACTION_ADDED: "reaction_added",
  REACTION_REMOVED: "reaction_removed"
};


/**
 * Hook pour gérer les messages dans un canal d'un espace de workspace avec Redux
 */
export const useReduxMessages = (
  workspaceUuid: UUID | null,
  channelUuid: UUID,
  userUuid: UUID,
  currentUserUuid: UUID,
) => {
  // État pour la connexion WebSocket
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);

  // Utiliser useAuth si disponible, sinon utiliser currentUserUuid fourni en paramètre
  let currentUser = { uuid: currentUserUuid } as {
    uuid: UUID;
    username: string;
  } | null;
  
  if (useAuth) {
    try {
      const authContext = useAuth();
      currentUser = authContext?.user || currentUser;
    } catch (error) {
      console.log("Erreur lors de l'utilisation de useAuth:", error);
    }
  }

  // Utiliser les hooks Redux pour récupérer les messages
  const { 
    data: workspaceMessages = [], 
    isLoading: isWorkspaceMessagesLoading,
    error: workspaceMessagesError,
    refetch: refetchWorkspaceMessages
  } = useGetMessagesQuery(
    workspaceUuid && channelUuid 
      ? { workspaceUuid, channelUuid } 
      : { workspaceUuid: '' as UUID, channelUuid: '' as UUID },
    { skip: !workspaceUuid || !channelUuid }
  );

  const { 
    data: directMessages = [], 
    isLoading: isDirectMessagesLoading,
    error: directMessagesError,
    refetch: refetchDirectMessages
  } = useGetDirectMessagesQuery(
    userUuid,
    { skip: !userUuid }
  );

  // Mutations Redux
  const [sendWorkspaceMessage, { isLoading: isSendingWorkspaceMessage }] = useSendWorkspaceMessageMutation();
  const [sendDirectMessage, { isLoading: isSendingDirectMessage }] = useSendDirectMessageMutation();
  const [editMessage, { isLoading: isEditingMessage }] = useEditMessageMutation();
  const [deleteMessage, { isLoading: isDeletingMessage }] = useDeleteMessageMutation();
  const [addReaction, { isLoading: isAddingReaction }] = useAddReactionMutation();
  const [addDirectMessageReaction, { isLoading: isAddingDirectMessageReaction }] = useAddDirectMessageReactionMutation();
  const [removeReaction, { isLoading: isRemovingReaction }] = useRemoveReactionMutation();
  const [removeDirectMessageReaction, { isLoading: isRemovingDirectMessageReaction }] = useRemoveDirectMessageReactionMutation();

  // Déterminer les messages à afficher en fonction du contexte
  const messages = workspaceUuid ? workspaceMessages : directMessages;
  const isLoading = workspaceUuid ? isWorkspaceMessagesLoading : isDirectMessagesLoading;
  const error = workspaceUuid 
    ? workspaceMessagesError 
      ? typeof workspaceMessagesError === 'string' 
        ? workspaceMessagesError 
        : 'Erreur lors du chargement des messages'
      : null
    : directMessagesError
      ? typeof directMessagesError === 'string'
        ? directMessagesError
        : 'Erreur lors du chargement des messages'
      : null;

      console.log("messages", messages);

  // Vérifier l'état de la connexion WebSocket périodiquement
  useEffect(() => {
    // Vérifier l'état initial de la connexion
    const initialConnected = websocketService.isConnected();
    setIsWebSocketConnected(initialConnected);

    // Fonction pour se connecter au WebSocket
    const getTokenAndConnect = async () => {
      try {
          const token = await AsyncStorage.getItem("userToken");
          if (token) {
              console.log(
                  "useMessages - Token récupéré, tentative de connexion WebSocket",
              );
              websocketService.connect(token).catch((error) => {
                  console.error(
                      "useMessages - Impossible de se connecter au WebSocket:",
                      error,
                  );
              });
          } else {
              console.error(
                  "useMessages - Impossible de se connecter au WebSocket: token manquant",
              );
              // Essayer de récupérer le token depuis useAuth si disponible
              if (currentUser?.uuid) {
                  console.log(
                      "useMessages - Tentative de récupération du token depuis currentUser",
                  );
                  // Utiliser l'UUID comme token temporaire si nécessaire
                  const tempToken = currentUser.uuid.toString();
                  websocketService
                      .connect(tempToken)
                      .catch((error) => {
                          console.error(
                              "useMessages - Impossible de se connecter au WebSocket avec UUID:",
                              error,
                          );
                      });
              }
          }
      } catch (error) {
          console.error(
              "useMessages - Erreur lors de la récupération du token:",
              error,
          );
      }
    };

    // Se connecter si non connecté
    if (!initialConnected) {
      console.log(
        "useReduxMessages - WebSocket non connecté, tentative de connexion...",
      );
      getTokenAndConnect();
    }

    // Vérifier périodiquement l'état de la connexion
    const checkInterval = setInterval(() => {
      const connected = websocketService.isConnected();
      if (connected !== isWebSocketConnected) {
        console.log(
          `useReduxMessages - État WebSocket changé: ${connected ? "connecté" : "déconnecté"}`,
        );
        setIsWebSocketConnected(connected);
      }
    }, 3000);

    // Nettoyage lors du démontage du composant
    return () => clearInterval(checkInterval);
    }, [isWebSocketConnected]);

  // Fonction pour rafraîchir les messages
  const fetchMessages = useCallback(() => {
    if (workspaceUuid) {
      refetchWorkspaceMessages();
    } else if (userUuid) {
      refetchDirectMessages();
    }
  }, [workspaceUuid, userUuid, refetchWorkspaceMessages, refetchDirectMessages]);

  // Fonction pour envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    if (!channelUuid) {
      console.error(
        "useReduxMessages - sendMessage - Erreur: channelUuid manquant",
      );
      return null;
    }

    if (!content.trim()) {
      console.error(
        "useReduxMessages - sendMessage - Erreur: contenu vide",
      );
      return null;
    }

    if (!currentUser?.uuid) {
      console.error(
        "useReduxMessages - sendMessage - Erreur: UUID utilisateur manquant",
      );
      return null;
    }

    try {
      const messageData = {
        message: content,
        is_public: !!workspaceUuid,
        source_uuid: currentUser.uuid,
        destination_uuid: channelUuid,
      };

      let newMessage: any;

      // Essayer d'envoyer le message via WebSocket si connecté
      if (isWebSocketConnected) {
        try {
          if (workspaceUuid) {
            websocketService.sendMessageToChannel(
              channelUuid,
              content,
            );
          } else if (userUuid) {
            websocketService.sendDirectMessage(
              userUuid,
              content,
            );
          }
          // Continuer avec l'API REST pour s'assurer que le message est bien envoyé
        } catch (wsError) {
          console.error(
            "useReduxMessages - sendMessage - Erreur WebSocket, utilisation de l'API REST:",
            wsError,
          );
        }
      }

      // Envoyer le message via l'API REST (toujours faire cela, même si WebSocket est connecté)
      try {
        if (workspaceUuid) {
          newMessage = await sendWorkspaceMessage({
            workspaceUuid,
            channelUuid,
            data: messageData,
          }).unwrap();
        } else if (userUuid) {
          // Envoyer un message privé
          console.log(
            `useReduxMessages - sendMessage - Envoi du message privé à l'utilisateur ${userUuid}, canal ${channelUuid}`,
          );
          // Utiliser la nouvelle API pour envoyer des messages privés
          newMessage = await sendDirectMessage({
            userUuid,
            data: messageData,
          }).unwrap();
        } else {
          throw new Error(
            "Soit workspaceUuid soit userUuid doit être fourni",
          );
        }
      } catch (apiError: any) {
        console.error(
          "useReduxMessages - sendMessage - Erreur API:",
          apiError,
        );

        // Si WebSocket a réussi mais API a échoué, on peut considérer que le message est envoyé
        if (isWebSocketConnected) {
          // Créer un message temporaire avec un UUID généré côté client
          newMessage = {
            uuid: `temp-${Date.now()}` as unknown as UUID,
            message: messageData.message,
            is_public: true,
            source: currentUser?.uuid || "",
            date: new Date().toISOString(),
            destination_channel: channelUuid,
            destination_user: null,
          };

          console.log(
            "useReduxMessages - sendMessage - Message envoyé via WebSocket uniquement, création d'un message temporaire",
          );
        } else {
          // Si ni WebSocket ni API n'ont réussi, lever une exception
          if (
            apiError?.message?.includes("ECONNREFUSED") ||
            apiError?.code === "ERR_CONNECTION_REFUSED"
          ) {
            throw new Error(
              "Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.",
            );
          }
          throw apiError;
        }
      }

      // Rafraîchir les messages pour récupérer le nouveau message
      fetchMessages();

      return newMessage;
    } catch (err) {
      console.error(
        "useReduxMessages - sendMessage - Erreur lors de l'envoi du message:",
        err,
      );
      return null;
    }
  }, [workspaceUuid, userUuid, channelUuid, isWebSocketConnected, currentUser, sendWorkspaceMessage, sendDirectMessage, fetchMessages]);

  // Fonction pour éditer un message
  const editMessageContent = useCallback(async (messageUuid: UUID, content: string) => {
    if (!messageUuid) {
      console.error(
        "useReduxMessages - editMessageContent - Erreur: messageUuid manquant",
      );
      return null;
    }

    if (!content.trim()) {
      console.error(
        "useReduxMessages - editMessageContent - Erreur: contenu vide",
      );
      return null;
    }

    try {
      // Essayer d'envoyer la modification via WebSocket si connecté
      if (isWebSocketConnected) {
        try {
          // Utiliser le WebSocket pour notifier de la modification
          console.log(
            "useReduxMessages - editMessageContent - Notification WebSocket de modification",
          );
          // Note: Implémentation à adapter selon les méthodes disponibles dans websocketService
          // websocketService.notifyMessageEdited(channelUuid, messageUuid, content);
        } catch (wsError) {
          console.error(
            "useReduxMessages - editMessageContent - Erreur WebSocket, utilisation de l'API REST uniquement:",
            wsError,
          );
        }
      }

      // Toujours utiliser l'API REST pour la modification
      const updatedMessage = await editMessage({
        workspaceUuid,
        userUuid: workspaceUuid ? null : userUuid,
        channelUuid,
        messageUuid,
        content,
      }).unwrap();

      // Rafraîchir les messages
      fetchMessages();

      return updatedMessage;
    } catch (error) {
      console.error(
        "useReduxMessages - editMessageContent - Erreur:",
        error,
      );
      return null;
    }
  }, [workspaceUuid, userUuid, channelUuid, isWebSocketConnected, editMessage, fetchMessages]);

  // Fonction pour supprimer un message
  const deleteMessageById = useCallback(async (messageUuid: UUID) => {
    if (!messageUuid) {
      console.error(
        "useReduxMessages - deleteMessageById - Erreur: messageUuid manquant",
      );
      return null;
    }

    try {
      // Essayer d'envoyer la suppression via WebSocket si connecté
      if (isWebSocketConnected) {
        try {
          // Utiliser le WebSocket pour notifier de la suppression
          console.log(
            "useReduxMessages - deleteMessageById - Notification WebSocket de suppression",
          );
          // Note: Implémentation à adapter selon les méthodes disponibles dans websocketService
          // websocketService.notifyMessageDeleted(channelUuid, messageUuid);
        } catch (wsError) {
          console.error(
            "useReduxMessages - deleteMessageById - Erreur WebSocket, utilisation de l'API REST uniquement:",
            wsError,
          );
        }
      }

      // Toujours utiliser l'API REST pour la suppression
      const result = await deleteMessage({
        workspaceUuid,
        userUuid: workspaceUuid ? null : userUuid,
        channelUuid,
        messageUuid,
      }).unwrap();

      // Rafraîchir les messages
      fetchMessages();

      return result;
    } catch (error) {
      console.error(
        "useReduxMessages - deleteMessageById - Erreur:",
        error,
      );
      return null;
    }
  }, [workspaceUuid, userUuid, channelUuid, isWebSocketConnected, deleteMessage, fetchMessages]);

  // Fonction pour ajouter une réaction
  const addReactionToMessage = useCallback(async (messageUuid: UUID, emoji: string) => {
    if (!messageUuid) {
      console.error(
        "useReduxMessages - addReactionToMessage - Erreur: messageUuid manquant",
      );
      return null;
    }

    if (!emoji) {
      console.error(
        "useReduxMessages - addReactionToMessage - Erreur: emoji manquant",
      );
      return null;
    }

    if (!currentUser?.uuid) {
      console.error(
        "useReduxMessages - addReactionToMessage - Erreur: UUID de l'utilisateur courant manquant",
      );
      return null;
    }

    try {
      const reactionData = {
        emoji,
        user_uuid: currentUser.uuid,
        message_uuid: messageUuid,
      };

      let result;

      if (workspaceUuid) {
        // Ajouter une réaction à un message dans un canal de workspace
        result = await addReaction({
          workspaceUuid,
          channelUuid,
          messageUuid,
          data: reactionData,
        }).unwrap();
      } else {
        // Ajouter une réaction à un message privé
        result = await addDirectMessageReaction({
          userUuid,
          channelUuid,
          messageUuid,
          data: reactionData,
        }).unwrap();
      }

      // Rafraîchir les messages
      fetchMessages();
      
      return result;
    } catch (error) {
      console.error(
        "useReduxMessages - addReactionToMessage - Erreur:",
        error,
      );
      return null;
    }
  }, [
    currentUser,
    workspaceUuid,
    channelUuid,
    userUuid,
    addReaction,
    addDirectMessageReaction,
    fetchMessages,
  ]);

  // Fonction pour supprimer une réaction
  const removeReactionFromMessage = useCallback(async (messageUuid: UUID, reactionUuid: UUID) => {
    if (!messageUuid) {
      console.error(
        "useReduxMessages - removeReactionFromMessage - Erreur: messageUuid manquant",
      );
      return null;
    }

    if (!reactionUuid) {
      console.error(
        "useReduxMessages - removeReactionFromMessage - Erreur: reactionUuid manquant",
      );
      return null;
    }

    try {
      let result;

      if (workspaceUuid) {
        // Supprimer une réaction d'un message dans un canal de workspace
        result = await removeReaction({
          workspaceUuid,
          channelUuid,
          messageUuid,
          reactionUuid,
        }).unwrap();
      } else {
        // Supprimer une réaction d'un message privé
        result = await removeDirectMessageReaction({
          userUuid,
          channelUuid,
          messageUuid,
          reactionUuid,
        }).unwrap();
      }

      // Rafraîchir les messages
      fetchMessages();

      return result;
    } catch (error) {
      console.error(
        "useReduxMessages - removeReactionFromMessage - Erreur:",
        error,
      );
      return null;
    }
  }, [
    workspaceUuid,
    channelUuid,
    userUuid,
    removeReaction,
    removeDirectMessageReaction,
    fetchMessages,
  ]);

  // S'abonner aux événements WebSocket pour les messages
  useEffect(() => {
    if (!channelUuid) {
      console.log(
        "useReduxMessages - useEffect WebSocket - Impossible de s'abonner: channelUuid manquant",
      );
      return;
    }

    if (!isWebSocketConnected) {
      console.log(
        "useReduxMessages - useEffect WebSocket - WebSocket non connecté, en attente de connexion...",
      );
      return;
    }

    console.log(
      `useReduxMessages - useEffect WebSocket - Abonnement aux événements pour le canal ${channelUuid}`,
    );

    // S'abonner aux événements backend et mobile (grâce au mapping dans websocket.service.ts)

    // Gérer les nouveaux messages - écouter à la fois 'message_sent' et 'message.created'
    const onMessageCreated = websocketService.on(
      "message_sent",
      (data: any) => {
        // Vérifier si le message appartient au canal actuel
        const isForCurrentChannel =
          (data.destination_channel &&
            (typeof data.destination_channel === 'string' 
              ? data.destination_channel === channelUuid
              : data.destination_channel.uuid === channelUuid)) ||
          (data.destination_user &&
            (typeof data.destination_user === 'string'
              ? data.destination_user === userUuid
              : data.destination_user.uuid === userUuid));

        if (isForCurrentChannel) {
          console.log(
            "useReduxMessages - WebSocket - Nouveau message pour ce canal:",
            data,
          );
          fetchMessages();
        }
      },
    );

    // Gérer les mises à jour de messages - écouter à la fois 'message_updated' et 'message.updated'
    const onMessageUpdated = websocketService.on(
      "message_updated",
      (data: any) => {
        // Vérifier si le message appartient au canal actuel
        const isForCurrentChannel =
          (data.destination_channel &&
            (typeof data.destination_channel === 'string' 
              ? data.destination_channel === channelUuid
              : data.destination_channel.uuid === channelUuid)) ||
          (data.destination_user &&
            (typeof data.destination_user === 'string'
              ? data.destination_user === userUuid
              : data.destination_user.uuid === userUuid));

        if (isForCurrentChannel) {
          console.log("useReduxMessages - Message mis à jour via WebSocket pour ce canal");
          fetchMessages();
        }
      },
    );

    // Gérer les suppressions de messages - écouter à la fois 'message_removed' et 'message.removed'
    const onMessageRemoved = websocketService.on(
      "message_removed",
      (data: { messageUuid: UUID }) => {
        console.log("useReduxMessages - Message supprimé via WebSocket");
        fetchMessages();
      },
    );

    // Gérer les ajouts de réactions
    const onReactionAdded = websocketService.on(
      WS_EVENTS.REACTION_ADDED,
      () => {
        console.log("useReduxMessages - Réaction ajoutée via WebSocket");
        fetchMessages();
      },
    );

    // Gérer les suppressions de réactions
    const onReactionRemoved = websocketService.on(
      WS_EVENTS.REACTION_REMOVED,
      () => {
        console.log("useReduxMessages - Réaction supprimée via WebSocket");
        fetchMessages();
      },
    );

    // Écouter également l'événement générique 'message_sent' du socket.io
    const onSocketMessage = websocketService.on(
      "message_sent",
      (data: any) => {
        if (data && data.event && data.payload) {
          console.log(
            `useReduxMessages - Socket.io - Événement générique reçu: ${data.event}`,
            data.payload,
          );
          // Le websocketService va automatiquement propager aux bons listeners grâce au mapping
        }
      },
    );

    // Nettoyage des abonnements
    return () => {
      console.log(
        `useReduxMessages - useEffect WebSocket - Désabonnement des événements pour le canal ${channelUuid}`,
      );
      onMessageCreated();
      onMessageUpdated();
      onMessageRemoved();
      onReactionAdded();
      onReactionRemoved();
      onSocketMessage();
    };
  }, [channelUuid, isWebSocketConnected, userUuid, fetchMessages]);

  // Fonction pour configurer manuellement la connexion WebSocket
  const setupWebSocket = useCallback((token: string) => {
    console.log("useReduxMessages - Configuration manuelle du WebSocket avec token");
    websocketService.connect(token)
      .then(() => {
        setIsWebSocketConnected(true);
        console.log("useReduxMessages - WebSocket connecté avec succès");
      })
      .catch((error) => {
        console.error("useReduxMessages - Erreur lors de la connexion WebSocket:", error);
      });
  }, []);

  // Fonction pour déconnecter manuellement le WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log("useReduxMessages - Déconnexion manuelle du WebSocket");
    websocketService.disconnect();
    setIsWebSocketConnected(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isWebSocketConnected,
    sendMessage,
    editMessage: editMessageContent,
    deleteMessage: deleteMessageById,
    addReaction: addReactionToMessage,
    removeReaction: removeReactionFromMessage,
    refreshMessages: fetchMessages,
    setupWebSocket,
    disconnectWebSocket,
  };
};

export default useReduxMessages;
