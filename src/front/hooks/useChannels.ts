import { useState, useEffect } from "react";
import channelService from "../services/channel.service";

const useChannelsByWorkspace = (workspaceUuid: string | null) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceUuid) {
      setChannels([]);
      return;
    }

    setLoading(true);
    setError(null);

    channelService.getAll()
      .then(allChannels => {
        const filtered = allChannels.filter(
          (channel: any) => channel.workspaceUuid === workspaceUuid
        );
        setChannels(filtered);
      })
      .catch(err => setError(err.message || "Erreur lors du chargement des channels"))
      .finally(() => setLoading(false));
  }, [workspaceUuid]);

  return { channels, loading, error };
};

export default useChannelsByWorkspace;
