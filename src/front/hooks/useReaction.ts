import { useState, useEffect } from "react";
import { ReactionsService, Reaction } from "../services/reactionService";

interface UseReactionsParams {
  workspaceUuid?: string;
  userUuid?: string;
  channelUuid: string;
  messageUuid: string;
  currentUserUuid: string; // user actuel (pour poster / toggle réaction)
}

export const useReactions = ({
  workspaceUuid,
  userUuid,
  channelUuid,
  messageUuid,
  currentUserUuid,
}: UseReactionsParams) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReactionsService.getReactions({
        workspaceUuid,
        userUuid,
        channelUuid,
        messageUuid,
      });
      setReactions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReactions();
  }, [workspaceUuid, userUuid, channelUuid, messageUuid]);

  const toggleReaction = async (emoji: string) => {
    setError(null);
    try {
      const existing = reactions.find(
        (r) => r.emoji === emoji && r.reactedByUser
      );
      if (existing) {
        // Supprime la réaction
        await ReactionsService.removeReaction({
          workspaceUuid,
          userUuid,
          channelUuid,
          messageUuid,
          reactionUuid: existing.uuid,
        });
        setReactions((prev) =>
          prev
            .map((r) =>
              r.uuid === existing.uuid
                ? { ...r, count: r.count - 1, reactedByUser: false }
                : r
            )
            .filter((r) => r.count > 0)
        );
      } else {
        // Ajoute la réaction
        const newReaction = await ReactionsService.addReaction({
          workspaceUuid,
          userUuid,
          channelUuid,
          messageUuid,
          dto: { emoji, userUuid: currentUserUuid },
        });
        const found = reactions.find((r) => r.emoji === emoji);
        if (found) {
          setReactions((prev) =>
            prev.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, reactedByUser: true }
                : r
            )
          );
        } else {
          setReactions((prev) => [...prev, { ...newReaction, reactedByUser: true }]);
        }
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return { reactions, loading, error, toggleReaction, loadReactions };
};
