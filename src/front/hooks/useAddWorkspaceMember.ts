import { useState } from "react";
import { addWorkspaceMember } from "../services/addWorkspaceMember";

export const useAddWorkspaceMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = async (workspaceId: string, userUUID: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await addWorkspaceMember(workspaceId, userUUID);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addMember, loading, error };
};
