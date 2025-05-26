import { useState } from "react";
import workspaceService from "../services/parametreWorkspacesService";

export function useUpdateWorkspaceName() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateName = async (token: string, workspaceId: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedWorkspace = await workspaceService.updateName(token, workspaceId, name);
      setIsLoading(false);
      return updatedWorkspace;
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      setIsLoading(false);
      throw err;
    }
  };

  return { updateName, isLoading, error };
}
