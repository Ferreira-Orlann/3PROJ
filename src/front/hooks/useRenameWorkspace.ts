import { useState } from "react";
import { renameWorkspace } from "../services/renameWorkspace";

export  const useRenameWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rename = async (id: string, newName: string) => {
    try {
      const updated = await renameWorkspace(id, newName);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { rename, loading, error };
};
