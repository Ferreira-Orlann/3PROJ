import { UUID } from "crypto";
import authService from "./auth.service";

export const renameWorkspace = async (id: string, newName: string) => {
    let uuid = id as UUID
  const response = await fetch(`http://localhost:3000/workspaces/${uuid}`, {
    method: "PUT",
    body: JSON.stringify({ name: newName }),
    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authService.getSession().token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur renommage : ${response.status} ${response.statusText} - ${errorText}`);
  }

  console.log("Renamed workspace:", await response.json());
  return response.json();
};
