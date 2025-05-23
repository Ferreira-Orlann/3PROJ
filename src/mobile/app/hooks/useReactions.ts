import { useState, useCallback, useEffect } from "react";
import { UUID } from "crypto";
import reactionService, {
    Reaction,
    CreateReactionData,
} from "../services/api/endpoints/reactions";
import websocketService from "../services/websocket/websocket.service";
import { useAuth } from "../context/AuthContext";

/**
 * Hook pour gérer les réactions aux messages
 */
export const useReactions = (
    workspaceUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID,
    userUuid?: UUID,
) => {
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

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
                fetchedReactions = await reactionService.getReactions(
                    workspaceUuid,
                    channelUuid,
                    messageUuid,
                );
            } else if (userUuid) {
                fetchedReactions =
                    await reactionService.getDirectMessageReactions(
                        userUuid,
                        channelUuid,
                        messageUuid,
                    );
            } else {
                throw new Error(
                    "Soit workspaceUuid soit userUuid doit être fourni",
                );
            }

            setReactions(fetchedReactions);
        } catch (err) {
            console.error("Erreur lors du chargement des réactions:", err);
            setError(
                "Impossible de charger les réactions. Veuillez réessayer.",
            );
        } finally {
            setLoading(false);
        }
    }, [workspaceUuid, userUuid, channelUuid, messageUuid]);

    /**
     * Ajoute une réaction à un message
     */
    const addReaction = useCallback(
        async (emoji: string) => {
            if (!messageUuid || !userUuid || !channelUuid) {
                console.error(
                    "useReactions - addReaction - messageUuid, userUuid ou channelUuid manquant",
                );
                return null;
            }

            setError(null);

            try {
                const reactionData: CreateReactionData = {
                    emoji,
                    user_uuid: userUuid,
                    message_uuid: messageUuid,
                };

                let newReaction: Reaction;

                if (workspaceUuid) {
                    newReaction = await reactionService.addReaction(
                        workspaceUuid,
                        channelUuid,
                        messageUuid,
                        reactionData,
                    );
                } else {
                    newReaction =
                        await reactionService.addDirectMessageReaction(
                            userUuid,
                            channelUuid,
                            messageUuid,
                            reactionData,
                        );
                }

                setReactions((prev) => {
                    if (prev.some((r) => r.uuid === newReaction.uuid)) {
                        return prev;
                    }
                    return [...prev, newReaction];
                });

                return newReaction;
            } catch (err) {
                console.error(
                    "useReactions - addReaction - Erreur lors de l'ajout de la réaction:",
                    err,
                );
                setError(
                    "Impossible d'ajouter la réaction. Veuillez réessayer.",
                );
                return null;
            }
        },
        [messageUuid, userUuid],
    );

    /**
     * Supprime une réaction d'un message
     */
    const removeReaction = useCallback(async (reactionUuid: UUID) => {
        if (!reactionUuid || !messageUuid || !channelUuid) {
            console.error(
                "useReactions - removeReaction - reactionUuid, messageUuid ou channelUuid manquant",
            );
            return false;
        }

        setError(null);

        try {
            if (workspaceUuid) {
                await reactionService.removeReaction(
                    workspaceUuid,
                    channelUuid,
                    messageUuid,
                    reactionUuid,
                );
            } else if (userUuid) {
                await reactionService.removeDirectMessageReaction(
                    userUuid,
                    channelUuid,
                    messageUuid,
                    reactionUuid,
                );
            } else {
                throw new Error(
                    "Soit workspaceUuid soit userUuid doit être fourni",
                );
            }

            setReactions((prev) =>
                prev.filter((reaction) => reaction.uuid !== reactionUuid),
            );

            return true;
        } catch (err) {
            console.error(
                "useReactions - removeReaction - Erreur lors de la suppression de la réaction:",
                err,
            );
            setError(
                "Impossible de supprimer la réaction. Veuillez réessayer.",
            );
            return false;
        }
    }, []);

    /**
     * Vérifie si l'utilisateur a déjà réagi avec cet emoji
     */
    const hasUserReacted = useCallback(
        (emoji: string): boolean => {
            if (!userUuid) return false;

            const hasReacted = reactions.some(
                (reaction) =>
                    reaction.emoji === emoji && reaction.user.uuid === userUuid,
            );

            return hasReacted;
        },
        [reactions, userUuid],
    );

    /**
     * Trouve la réaction de l'utilisateur avec un emoji spécifique
     */
    const getUserReaction = useCallback(
        (emoji: string): Reaction | null => {
            if (!userUuid) return null;

            return (
                reactions.find(
                    (reaction) =>
                        reaction.emoji === emoji &&
                        reaction.user.uuid === userUuid,
                ) || null
            );
        },
        [reactions, userUuid],
    );

    useEffect(() => {
        if (messageUuid && channelUuid && (workspaceUuid || userUuid)) {
            fetchReactions();
        }
    }, [messageUuid, channelUuid, workspaceUuid, userUuid, fetchReactions]);

    useEffect(() => {
        if (!messageUuid || !websocketService.isConnected()) {
            return;
        }

        const onReactionCreated = websocketService.on(
            "reaction_added",
            (data: Reaction) => {
                if (data.message.uuid === messageUuid) {
                    setReactions((prev) => {
                        // Éviter les doublons
                        if (prev.some((r) => r.uuid === data.uuid)) {
                            return prev;
                        }
                        return [...prev, data];
                    });
                }
            },
        );

        const onReactionUpdated = websocketService.on(
            "reaction_updated",
            (data: Reaction) => {
                if (data.message.uuid === messageUuid) {
                    setReactions((prev) =>
                        prev.map((reaction) =>
                            reaction.uuid === data.uuid ? data : reaction,
                        ),
                    );
                }
            },
        );

        const onReactionRemoved = websocketService.on(
            "reaction_removed",
            (data: { reactionUuid: UUID }) => {
                setReactions((prev) =>
                    prev.filter(
                        (reaction) => reaction.uuid !== data.reactionUuid,
                    ),
                );
            },
        );

        return () => {
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
        reactions.forEach((reaction) => emojis.add(reaction.emoji));
        return Array.from(emojis);
    }, [reactions]);

    /**
     * Compte le nombre de réactions pour un emoji donné
     */
    const getReactionCount = useCallback(
        (emoji: string): number => {
            return reactions.filter((reaction) => reaction.emoji === emoji)
                .length;
        },
        [reactions],
    );

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
        getReactionCount,
    };
};

export default useReactions;
