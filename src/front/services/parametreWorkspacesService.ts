// workspace.service.ts
const updateName = async (token: string, workspaceId: string, name: string) => {
  const res = await fetch(`http://localhost:3000/workspaces/${workspaceId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "Erreur lors du renommage du workspace");
  }

  return res.json(); // workspace mis à jour retourné par l’API
};

export default { updateName };
