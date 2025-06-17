// src/services/workspaceMembers.service.ts
import { UUID } from "crypto";
import authService from "./auth.service";

export const workspaceMembersService = {
  getAll: async (workspaceId: UUID) => {
    const token = authService.getSession().token;
    const response = await fetch(`http://localhost:3000/workspaces/${workspaceId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Impossible de charger les membres");
    }

    return await response.json(); 
  },
};
