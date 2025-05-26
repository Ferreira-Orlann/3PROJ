// ChatInput.tsx
import { useEffect, useRef, useState } from "react";
import styles from "../styles/privateChat.module.css";

interface Message {
  uuid: string;
  message: string;
}

interface Props {
  onSend: (messageText: string, file: File | null) => void;
  replyTo: Message | null;
  messageToEdit: Message | null;
  onCancelEdit: () => void;
}

export default function ChatInput({
  onSend,
  replyTo,
  messageToEdit,
  onCancelEdit,
}: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messageToEdit) {
      setText(messageToEdit.message);
    }
  }, [messageToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(text, file);
    setText("");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputBar}>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          messageToEdit ? "Modifier le message..." : replyTo ? "Répondre..." : "Écrire un message..."
        }
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: "none" }}
        id="fileInput"
      />
      <label htmlFor="fileInput" className={styles.actionButton}>
        📎
      </label>
      {messageToEdit && (
        <button type="button" onClick={onCancelEdit} className={styles.actionButton}>
          ❌
        </button>
      )}
      <button type="submit">Envoyer</button>
    </form>
  );
}
