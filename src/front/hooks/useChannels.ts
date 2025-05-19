// hooks/useChannels.ts
import { useState, useEffect } from "react";
import { channelService } from "../services/channel.service";  // Assure-toi que ce service existe
import { Channel } from "../types/channel";  // Définis le type Channel si ce n'est pas déjà fait

export const useChannels = (workspaceUuid: string) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const fetchedChannels = await channelService.getByWorkspaceUuid(workspaceUuid);
        setChannels(fetchedChannels);
      } catch (err: any) {
        setError("Erreur lors de la récupération des canaux.");
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [workspaceUuid]);

  return { channels, loading, error };
};
