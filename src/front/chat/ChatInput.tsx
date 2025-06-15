import { useEffect, useState } from "react";
import { FiX, FiSend, FiPaperclip } from "react-icons/fi";
import styles from "../styles/privateChat.module.css";
import type { Message } from "../types/messages";

interface Props {
  editingMessage?: Message | null;
  onSend: (text: string, file?: File) => void;
  onCancelEdit: () => void;
}

export default function ChatInput({
  editingMessage,
  onSend,
  onCancelEdit,
}: Props) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.message ?? "");
      setFile(null); 
    } else {
      setMessage("");
      setFile(null);
    }
  }, [editingMessage]);

  const handleSend = () => {
    if (!message.trim() && !file) return;
    onSend(message.trim(), file ?? undefined);
    setMessage("");
    setFile(null);
  };

  return (
    <div className={styles.inputBarWrapper}>
      {editingMessage && (
        <div className={styles.editingBanner}>
          ✏️ Modification du message
          <button
            onClick={() => {
              onCancelEdit();
              setMessage("");
              setFile(null);
            }}
            className={styles.cancelEditButton}
            title="Annuler la modification"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      <div className={styles.inputBar}>
        <input
          type="text"
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.textInput}
        />



        <button
          className={styles.sendButton}
          onClick={handleSend}
          title={editingMessage ? "Modifier le message" : "Envoyer"}
        >
          <FiSend />
        </button>
      </div>

      {file && (
        <div className={styles.selectedFilePreview}>
          {/\.(jpe?g|png|gif|webp)$/i.test(file.name) ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Prévisualisation"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.selectedFileName}>📎 {file.name}</div>
          )}
          <button
            onClick={() => setFile(null)}
            className={styles.removeFileButton}
            title="Supprimer le fichier"
          >
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}
