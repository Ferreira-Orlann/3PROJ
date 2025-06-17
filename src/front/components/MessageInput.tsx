import React, { useState } from "react";
import "../styles/MessageInput.css";
import { useFileUpload } from "../hooks/useFileUpload";
import { fileService } from "../services/fileService";

const MessageInput = ({ onSend }: { onSend: (content: string) => void }) => {
  const [input, setInput] = useState("");
  const { handleUpload, loading, error } = useFileUpload();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSend(input.trim());
    setInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uuid = await handleUpload(file);
    if (uuid) {
      const fileUrl = fileService.getFileUrl(uuid);
      const message = `📎 Fichier : [${file.name}](${fileUrl})`; 
      onSend(message); 
    }
    e.target.value = ""; 
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Écrivez un message..."
        className="message-input-field"
        disabled={loading}
      />
      <input
        type="file"
        onChange={handleFileChange}
        className="message-file-input"
        disabled={loading}
      />
      <button type="submit" className="message-send-button" disabled={loading}>
        Envoyer
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default MessageInput;
