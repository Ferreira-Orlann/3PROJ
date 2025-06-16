// hooks/useAllReactions.ts
import { useEffect, useState } from "react";
import reactionService from "../services/reactionService";

type Reaction = {
  emoji: string;
  userUuid: string;
  messageUuid: string;
};

export const useAllReactions = () => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const data = await reactionService.getAllReactions(); // à adapter à ton service
        setReactions(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des réactions :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, []);

  return { reactions, loading };
};
