// src/components/MessageInput.tsx
import React, { useState } from "react";

const MessageInput = ({ onSend }: { onSend: (content: string) => void }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Votre message"
        style={{ flex: 1 }}
      />
      <button type="submit">Envoyer</button>
    </form>
  );
};

export default MessageInput;
