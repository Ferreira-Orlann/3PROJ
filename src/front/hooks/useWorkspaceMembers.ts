// src/hooks/useWorkspaceMembers.ts
import { useEffect, useState } from "react";
import { workspaceMembersService } from "../services/workspaceMembers.service";

export function useWorkspaceMembers(workspaceId: string) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await workspaceMembersService.getAll(workspaceId as any);
        setMembers(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [workspaceId]);

  return { members, loading, error };
}
