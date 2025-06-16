import { useState } from "react";
import workspacesService from "../services/workspaces.service";
import { Workspace } from "../types/workspace";

export function useDeleteWorkspace() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const remove = async (workspace: Pick<Workspace, "uuid">) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await workspacesService.delete(workspace);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error, success };
}
