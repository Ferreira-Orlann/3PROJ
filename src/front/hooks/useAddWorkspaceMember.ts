import { useState } from "react";
import { addWorkspaceMember } from "../services/workspaceMembersService";

export function useAddWorkspaceMember(workspaceId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function addMember(user_uuid: string) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await addWorkspaceMember(workspaceId, user_uuid);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { addMember, loading, error, success };
}
