import { useCallback, useState, useEffect } from "react";
import { UUID } from "crypto";
import { useAppSelector, useAppDispatch } from "./useAppRedux";
import websocketService from "../services/websocket/websocket.service";

// Import API hooks from Redux
import {
  useAddReactionMutation,
  useAddDirectMessageReactionMutation,
  useRemoveReactionMutation,
  useRemoveDirectMessageReactionMutation,
  useGetReactionsQuery,
  useGetDirectMessageReactionsQuery
} from "../store/api/reactionsApi";

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

// Types d'événements WebSocket
const WS_EVENTS = {
  REACTION_ADDED: "reaction_added",
  REACTION_UPDATED: "reaction_updated",
  REACTION_REMOVED: "reaction_removed"
};

/**
 * Hook pour gérer les réactions aux messages avec Redux
 */
export const useReduxReactions = (
  workspaceUuid: UUID | null,
  channelUuid: UUID,
  messageUuid: UUID,
  userUuid?: UUID
) => {
  // Utiliser useAuth si disponible, sinon utiliser userUuid fourni en paramètre
  let currentUser: { uuid: UUID } | null = null;
  
  if (useAuth) {
    try {
      const authContext = useAuth();
      currentUser = authContext?.user || null;
    } catch (error) {
      console.log("Erreur lors de l'utilisation de useAuth:", error);
    }
  }

  // État pour la connexion WebSocket
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);

  // Vérifier l'état de la connexion WebSocket
  useEffect(() => {
    // Vérifier l'état initial de la connexion
    const initialConnected = websocketService.isConnected();
    setIsWebSocketConnected(initialConnected);

    // Vérifier périodiquement l'état de la connexion
    const checkInterval = setInterval(() => {
      const connected = websocketService.isConnected();
      if (connected !== isWebSocketConnected) {
        console.log(
          `useReduxReactions - État WebSocket changé: ${connected ? "connecté" : "déconnecté"}`
        );
        setIsWebSocketConnected(connected);
      }
    }, 3000);

    return () => clearInterval(checkInterval);
  }, [isWebSocketConnected]);

  // Utiliser les hooks Redux pour récupérer les réactions
  const { 
    data: workspaceReactions = [], 
    isLoading: isWorkspaceReactionsLoading,
    error: workspaceReactionsError,
    refetch: refetchWorkspaceReactions
  } = useGetReactionsQuery(
    workspaceUuid && channelUuid && messageUuid
      ? { workspaceUuid, channelUuid, messageUuid }
      : { workspaceUuid: '' as UUID, channelUuid: '' as UUID, messageUuid: '' as UUID },
    { skip: !workspaceUuid || !channelUuid || !messageUuid }
  );

  const { 
    data: directMessageReactions = [], 
    isLoading: isDirectMessageReactionsLoading,
    error: directMessageReactionsError,
    refetch: refetchDirectMessageReactions
  } = useGetDirectMessageReactionsQuery(
    userUuid && channelUuid && messageUuid
      ? { userUuid, channelUuid, messageUuid }
      : { userUuid: '' as UUID, channelUuid: '' as UUID, messageUuid: '' as UUID },
    { skip: !userUuid || !channelUuid || !messageUuid || !!workspaceUuid }
  );

  // Mutations Redux
  const [addReaction, { isLoading: isAddingReaction }] = useAddReactionMutation();
  const [addDirectMessageReaction, { isLoading: isAddingDirectMessageReaction }] = useAddDirectMessageReactionMutation();
  const [removeReaction, { isLoading: isRemovingReaction }] = useRemoveReactionMutation();
  const [removeDirectMessageReaction, { isLoading: isRemovingDirectMessageReaction }] = useRemoveDirectMessageReactionMutation();

  // Déterminer les réactions à afficher en fonction du contexte
  const reactions = workspaceUuid ? workspaceReactions : directMessageReactions;
  const isLoading = workspaceUuid ? isWorkspaceReactionsLoading : isDirectMessageReactionsLoading;
  const error = workspaceUuid 
    ? workspaceReactionsError 
      ? typeof workspaceReactionsError === 'string' 
        ? workspaceReactionsError 
        : 'Erreur lors du chargement des réactions'
      : null
    : directMessageReactionsError
      ? typeof directMessageReactionsError === 'string'
        ? directMessageReactionsError
        : 'Erreur lors du chargement des réactions'
      : null;

  // Fonction pour rafraîchir les réactions
  const refreshReactions = useCallback(() => {
    if (workspaceUuid) {
      refetchWorkspaceReactions();
    } else if (userUuid) {
      refetchDirectMessageReactions();
    }
  }, [workspaceUuid, userUuid, refetchWorkspaceReactions, refetchDirectMessageReactions]);
  
  // S'abonner aux événements WebSocket pour les réactions
  useEffect(() => {
    if (!messageUuid) {
      console.log(
        "useReduxReactions - useEffect WebSocket - Impossible de s'abonner: messageUuid manquant",
      );
      return;
    }

    if (!isWebSocketConnected) {
      console.log(
        "useReduxReactions - useEffect WebSocket - WebSocket non connecté, en attente de connexion...",
      );
      return;
    }

    console.log(
      `useReduxReactions - useEffect WebSocket - Abonnement aux événements pour le message ${messageUuid}`,
    );

    // Gérer les nouvelles réactions
    const onReactionCreated = websocketService.on(
      WS_EVENTS.REACTION_ADDED,
      (data: any) => {
        if (data.message && data.message.uuid === messageUuid) {
          console.log(
            "useReduxReactions - WebSocket - Nouvelle réaction pour ce message:",
            data,
          );
          refreshReactions();
        }
      },
    );

    // Gérer les mises à jour de réactions
    const onReactionUpdated = websocketService.on(
      WS_EVENTS.REACTION_UPDATED,
      (data: any) => {
        if (data.message && data.message.uuid === messageUuid) {
          console.log("useReduxReactions - Réaction mise à jour via WebSocket");
          refreshReactions();
        }
      },
    );

    // Gérer les suppressions de réactions
    const onReactionRemoved = websocketService.on(
      WS_EVENTS.REACTION_REMOVED,
      (data: { reactionUuid: UUID }) => {
        console.log("useReduxReactions - Réaction supprimée via WebSocket");
        refreshReactions();
      },
    );

    // Nettoyage des abonnements
    return () => {
      console.log(
        `useReduxReactions - useEffect WebSocket - Désabonnement des événements pour le message ${messageUuid}`,
      );
      onReactionCreated();
      onReactionUpdated();
      onReactionRemoved();
    };
  }, [messageUuid, isWebSocketConnected, refreshReactions]);

  // Fonction pour ajouter une réaction
  const addReactionToMessage = useCallback(async (emoji: string) => {
    if (!messageUuid) {
      console.error(
        "useReduxReactions - addReactionToMessage - Erreur: messageUuid manquant",
      );
      return null;
    }

    if (!emoji) {
      console.error(
        "useReduxReactions - addReactionToMessage - Erreur: emoji manquant",
      );
      return null;
    }

    if (!currentUser?.uuid) {
      console.error(
        "useReduxReactions - addReactionToMessage - Erreur: UUID de l'utilisateur courant manquant",
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
      } else if (userUuid) {
        // Ajouter une réaction à un message privé
        result = await addDirectMessageReaction({
          userUuid,
          channelUuid,
          messageUuid,
          data: reactionData,
        }).unwrap();
      } else {
        throw new Error("Contexte de message invalide");
      }

      // Rafraîchir les réactions
      refreshReactions();
      
      return result;
    } catch (error) {
      console.error(
        "useReduxReactions - addReactionToMessage - Erreur:",
        error,
      );
      return null;
    }
  }, [
    currentUser,
    workspaceUuid,
    userUuid,
    channelUuid,
    messageUuid,
    addReaction,
    addDirectMessageReaction,
    refreshReactions,
  ]);

  // Fonction pour supprimer une réaction
  const removeReactionFromMessage = useCallback(async (reactionUuid: UUID) => {
    if (!messageUuid) {
      console.error(
        "useReduxReactions - removeReactionFromMessage - Erreur: messageUuid manquant",
      );
      return null;
    }

    if (!reactionUuid) {
      console.error(
        "useReduxReactions - removeReactionFromMessage - Erreur: reactionUuid manquant",
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
      } else if (userUuid) {
        // Supprimer une réaction d'un message privé
        result = await removeDirectMessageReaction({
          userUuid,
          channelUuid,
          messageUuid,
          reactionUuid,
        }).unwrap();
      } else {
        throw new Error("Contexte de message invalide");
      }

      // Rafraîchir les réactions
      refreshReactions();
      
      return result;
    } catch (error) {
      console.error(
        "useReduxReactions - removeReactionFromMessage - Erreur:",
        error,
      );
      return null;
    }
  }, [
    workspaceUuid,
    userUuid,
    channelUuid,
    messageUuid,
    removeReaction,
    removeDirectMessageReaction,
    refreshReactions,
  ]);

  // Vérifier si l'utilisateur courant a déjà réagi avec un emoji spécifique
  const hasUserReacted = useCallback((emoji: string) => {
    if (!currentUser?.uuid) return false;
    
    return reactions.some(
      (reaction) => 
        reaction.emoji === emoji && 
        (typeof reaction.user === 'object' ? reaction.user.uuid === currentUser.uuid : false)
    );
  }, [reactions, currentUser]);

  // Obtenir le nombre de réactions pour un emoji spécifique
  const getReactionCount = useCallback((emoji: string) => {
    return reactions.filter((reaction) => reaction.emoji === emoji).length;
  }, [reactions]);

  // Obtenir la réaction de l'utilisateur courant pour un emoji spécifique
  const getUserReaction = useCallback((emoji: string) => {
    if (!currentUser?.uuid) return null;
    
    return reactions.find(
      (reaction) => 
        reaction.emoji === emoji && 
        (typeof reaction.user === 'object' ? reaction.user.uuid === currentUser.uuid : false)
    ) || null;
  }, [reactions, currentUser]);

  // Fonction pour configurer manuellement la connexion WebSocket
  const setupWebSocket = useCallback((token: string) => {
    console.log("useReduxReactions - Configuration manuelle du WebSocket avec token");
    websocketService.connect(token)
      .then(() => {
        setIsWebSocketConnected(true);
        console.log("useReduxReactions - WebSocket connecté avec succès");
      })
      .catch((error) => {
        console.error("useReduxReactions - Erreur lors de la connexion WebSocket:", error);
      });
  }, []);

  // Fonction pour déconnecter manuellement le WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log("useReduxReactions - Déconnexion manuelle du WebSocket");
    websocketService.disconnect();
    setIsWebSocketConnected(false);
  }, []);

  return {
    reactions,
    isLoading,
    error,
    isWebSocketConnected,
    addReaction: addReactionToMessage,
    removeReaction: removeReactionFromMessage,
    refreshReactions,
    hasUserReacted,
    getReactionCount,
    getUserReaction,
    setupWebSocket,
    disconnectWebSocket,
  };
};

export default useReduxReactions;
