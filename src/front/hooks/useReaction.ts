// src/hooks/useReactions.ts
import { useState } from "react";
import reactionsService from "../services/reactionService";

export const useReactions = (messageUuid: string) => {
  const [loading, setLoading] = useState(false);

  const addReaction = async (emoji: string, userUuid: string) => {
    setLoading(true);
    try {
      await reactionsService.addReaction({ messageUuid, emoji, userUuid });
    } catch (error) {
      console.error("Erreur lors de l'ajout d'une réaction :", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    addReaction,
    loading,
  };
};
