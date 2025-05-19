// src/services/workspaceMembersService.ts

export async function addWorkspaceMember(workspaceId: string, user_uuid: string) {
    const res = await fetch(`/workspaces/${workspaceId}/members/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // adapte selon ton auth
      },
      body: JSON.stringify({ user_uuid }),
    });
  
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Erreur lors de l'ajout du membre");
    }
  
    return await res.json();
  }
  