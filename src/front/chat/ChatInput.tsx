import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import styles from "../styles/privateChat.module.css";

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() || selectedFile) {
      onSend(message.trim(), selectedFile);
      setMessage("");
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const cancelFile = () => setSelectedFile(null);

  return (
    <div className={styles.inputBar}>
      <input
        type="text"
        placeholder="Écrire un message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Bouton fichier violet avec icône */}
      <div className={styles.fileInputWrapper}>
        <button
          className={styles.fileButton}
          onClick={() => fileInputRef.current?.click()}
          title="Ajouter une pièce jointe"
        >
          <Paperclip size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.hiddenFileInput} // ← tu peux aussi créer ça si tu veux cacher le bouton nativement
        />
      </div>

      <button className={styles.sendButton} onClick={handleSend}>
        Envoyer
      </button>

      {/* Affichage de prévisualisation du fichier */}
      {selectedFile && (
        <div className={styles.selectedFilePreview}>
          {selectedFile.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Aperçu"
              className={styles.imageAttachment}
            />
          ) : (
            <span className={styles.selectedFileName}>{selectedFile.name}</span>
          )}
          <button className={styles.cancelReplyButton} onClick={cancelFile}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
