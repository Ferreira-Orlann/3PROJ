import { useState } from "react";
import { useAddWorkspaceMember } from "../../hooks/useAddWorkspaceMember";

type AddMemberFormProps = {
  workspaceId: string;
};

export const AddMemberForm = ({ workspaceId }: AddMemberFormProps) => {
  const [userUUID, setUserUUID] = useState("");
  const { addMember, loading, error } = useAddWorkspaceMember();
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!userUUID.trim()) {
      setMessage("Veuillez entrer l'UUID de l'utilisateur.");
      return;
    }
    try {
      await addMember(workspaceId, userUUID.trim());
      setMessage("Membre ajouté avec succès !");
      setUserUUID(""); 
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Ajouter un membre</h3>
      <input
        type="text"
        placeholder="UUID de l'utilisateur"
        value={userUUID}
        onChange={(e) => setUserUUID(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleAdd} disabled={loading}>
        {loading ? "Ajout en cours..." : "Ajouter"}
      </button>
      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
