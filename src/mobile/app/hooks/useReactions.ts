import { useState, useCallback, useEffect } from 'react';
import { UUID } from 'crypto';
import reactionService, { Reaction, CreateReactionData } from '../services/api/endpoints/reactions';
import websocketService from '../services/websocket/websocket.service';
// import { Events } from '../../../back/events.enum';
import { useAuth } from '../context/AuthContext'; // Supposons que ce hook existe pour récupérer l'utilisateur courant

/**
 * Hook pour gérer les réactions aux messages
 */
export const useReactions = (
  workspaceUuid: UUID | null, 
  channelUuid: UUID, 
  messageUuid: UUID,
  userUuid?: UUID
) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Hook hypothétique pour récupérer l'utilisateur courant

  /**
   * Charge les réactions d'un message
   */
  const fetchReactions = useCallback(async () => {
    if (!messageUuid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let fetchedReactions: Reaction[];
      
      if (workspaceUuid) {
        // Réactions d'un message dans un canal d'espace de travail
        fetchedReactions = await reactionService.getReactions(
          workspaceUuid, 
          channelUuid, 
          messageUuid
        );
      } else if (userUuid) {
        // Réactions d'un message privé
        fetchedReactions = await reactionService.getDirectMessageReactions(
          userUuid, 
          channelUuid, 
          messageUuid
        );
      } else {
        throw new Error('Soit workspaceUuid soit userUuid doit être fourni');
      }
      
      setReactions(fetchedReactions);
    } catch (err) {
      console.error('Erreur lors du chargement des réactions:', err);
      setError('Impossible de charger les réactions. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [workspaceUuid, userUuid, channelUuid, messageUuid]);

  /**
   * Ajoute une réaction à un message
   */
  const addReaction = useCallback(async (emoji: string) => {
    if (!messageUuid || !userUuid || !channelUuid) {
      console.error('useReactions - addReaction - messageUuid, userUuid ou channelUuid manquant');
      return null;
    }
    
    console.log(`useReactions - addReaction - Ajout de la réaction ${emoji} au message ${messageUuid}`);
    setError(null);
    
    try {
      const reactionData: CreateReactionData = {
        emoji,
        user_uuid: userUuid,
        message_uuid: messageUuid
      };
      
      console.log('useReactions - addReaction - Données de la réaction:', reactionData);
      
      let newReaction: Reaction;
      
      if (workspaceUuid) {
        // Ajouter une réaction à un message dans un canal d'espace de travail
        newReaction = await reactionService.addReaction(
          workspaceUuid, 
          channelUuid, 
          messageUuid, 
          reactionData
        );
      } else {
        // Ajouter une réaction à un message privé
        newReaction = await reactionService.addDirectMessageReaction(
          userUuid, 
          channelUuid, 
          messageUuid, 
          reactionData
        );
      }
      
      console.log('useReactions - addReaction - Réaction ajoutée avec succès:', newReaction);
      
      // Ajouter la nouvelle réaction à la liste (sera également mise à jour via WebSocket)
      setReactions(prev => {
        // Éviter les doublons
        if (prev.some(r => r.uuid === newReaction.uuid)) {
          return prev;
        }
        return [...prev, newReaction];
      });
      
      return newReaction;
    } catch (err) {
      console.error('useReactions - addReaction - Erreur lors de l\'ajout de la réaction:', err);
      setError('Impossible d\'ajouter la réaction. Veuillez réessayer.');
      return null;
    }
  }, [messageUuid, userUuid]);

  /**
   * Supprime une réaction d'un message
   */
  const removeReaction = useCallback(async (reactionUuid: UUID) => {
    if (!reactionUuid || !messageUuid || !channelUuid) {
      console.error('useReactions - removeReaction - reactionUuid, messageUuid ou channelUuid manquant');
      return false;
    }
    
    console.log(`useReactions - removeReaction - Suppression de la réaction ${reactionUuid}`);
    setError(null);
    
    try {
      if (workspaceUuid) {
        // Supprimer une réaction d'un message dans un canal d'espace de travail
        await reactionService.removeReaction(
          workspaceUuid, 
          channelUuid, 
          messageUuid, 
          reactionUuid
        );
      } else if (userUuid) {
        // Supprimer une réaction d'un message privé
        await reactionService.removeDirectMessageReaction(
          userUuid, 
          channelUuid, 
          messageUuid, 
          reactionUuid
        );
      } else {
        throw new Error('Soit workspaceUuid soit userUuid doit être fourni');
      }
      
      console.log('useReactions - removeReaction - Réaction supprimée avec succès');
      
      // Supprimer la réaction de la liste (sera également mise à jour via WebSocket)
      setReactions(prev => prev.filter(reaction => reaction.uuid !== reactionUuid));
      
      return true;
    } catch (err) {
      console.error('useReactions - removeReaction - Erreur lors de la suppression de la réaction:', err);
      setError('Impossible de supprimer la réaction. Veuillez réessayer.');
      return false;
    }
  }, []);

  /**
   * Vérifie si l'utilisateur a déjà réagi avec cet emoji
   */
  const hasUserReacted = useCallback((emoji: string): boolean => {
    if (!userUuid) return false;
    
    const hasReacted = reactions.some(reaction => 
      reaction.emoji === emoji && reaction.user.uuid === userUuid
    );
    
    return hasReacted;
  }, [reactions, userUuid]);

  /**
   * Trouve la réaction de l'utilisateur avec un emoji spécifique
   */
  const getUserReaction = useCallback((emoji: string): Reaction | null => {
    if (!userUuid) return null;
    
    return reactions.find(reaction => 
      reaction.emoji === emoji && reaction.user.uuid === userUuid
    ) || null;
  }, [reactions, userUuid]);


  
  // Charger les réactions au montage du composant
  useEffect(() => {
    if (messageUuid && channelUuid && (workspaceUuid || userUuid)) {
      console.log(`useReactions - useEffect - Chargement initial des réactions pour le message ${messageUuid}`);
      fetchReactions();
    }
  }, [messageUuid, channelUuid, workspaceUuid, userUuid, fetchReactions]);

  // S'abonner aux événements WebSocket pour les réactions
  useEffect(() => {
    if (!messageUuid || !websocketService.isConnected()) {
      return;
    }

    console.log(`useReactions - useEffect - Abonnement aux événements WebSocket pour le message ${messageUuid}`);
    
    // Gérer les nouvelles réactions
    const onReactionCreated = websocketService.on('reaction_added', (data: Reaction) => {
      console.log('useReactions - WebSocket - Nouvelle réaction reçue:', data);
      if (data.message.uuid === messageUuid) {
        setReactions(prev => {
          // Éviter les doublons
          if (prev.some(r => r.uuid === data.uuid)) {
            return prev;
          }
          return [...prev, data];
        });
      }
    });

    // Gérer les mises à jour de réactions
    const onReactionUpdated = websocketService.on('reaction_updated', (data: Reaction) => {
      console.log('useReactions - WebSocket - Réaction mise à jour reçue:', data);
      if (data.message.uuid === messageUuid) {
        setReactions(prev => 
          prev.map(reaction => reaction.uuid === data.uuid ? data : reaction)
        );
      }
    });

    // Gérer les suppressions de réactions
    const onReactionRemoved = websocketService.on('reaction_removed', (data: { reactionUuid: UUID }) => {
      console.log('useReactions - WebSocket - Réaction supprimée reçue:', data);
      setReactions(prev => prev.filter(reaction => reaction.uuid !== data.reactionUuid));
    });

    // Nettoyage des abonnements
    return () => {
      console.log(`useReactions - useEffect - Désabonnement des événements WebSocket pour le message ${messageUuid}`);
      onReactionCreated();
      onReactionUpdated();
      onReactionRemoved();
    };
  }, [messageUuid]);

  /**
   * Récupère les emojis uniques utilisés dans les réactions
   */
  const getUniqueEmojis = useCallback((): string[] => {
    const emojis = new Set<string>();
    reactions.forEach(reaction => emojis.add(reaction.emoji));
    return Array.from(emojis);
  }, [reactions]);
  
  /**
   * Compte le nombre de réactions pour un emoji donné
   */
  const getReactionCount = useCallback((emoji: string): number => {
    return reactions.filter(reaction => reaction.emoji === emoji).length;
  }, [reactions]);

  return {
    reactions,
    loading,
    error,
    fetchReactions,
    addReaction,
    removeReaction,
    hasUserReacted,
    getUserReaction,
    getUniqueEmojis,
    getReactionCount
  };
};

export default useReactions;
