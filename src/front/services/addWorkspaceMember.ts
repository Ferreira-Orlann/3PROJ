import authService from "./auth.service";

export const addWorkspaceMember = async (workspaceId: string, userUUID: string) => {
  const response = await fetch(`http://localhost:3000/workspaces/${workspaceId}/members/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authService.getSession().token}`,
    },
    body: JSON.stringify({ user_uuid: userUUID }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur ajout membre : ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
};
