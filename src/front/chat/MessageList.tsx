import { useEffect, useRef } from "react";
import styles from "../styles/privateChat.module.css";
import type { Message } from "../types/messages";
import type { User } from "../types/auth";
import { FiEdit2 } from "react-icons/fi";

interface Props {
  messages: Message[];
  sessionUserUUID: string;
  selectedUserUuid: string;
  users: User[];
  onEditStart: (m: Message) => void;
}

export default function MessageList({
  messages,
  sessionUserUUID,
  users,
  onEditStart
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.messageScroll}>
      {messages.length === 0 ? (
        <p className={styles.empty}>Aucun message</p>
      ) : (
        messages.map((msg) => {


          const isMine = msg.source_uuid === sessionUserUUID;
          const sender = users.find((u) => u.uuid === msg.source_uuid);

          return (
            <div
              key={msg.uuid}
              className={`${styles.messageBubble} ${isMine ? styles.sent : styles.received}`}
              onDoubleClick={() => isMine && onEditStart(msg)}
              title={isMine ? "Double-cliquez pour modifier" : ""}
            >
              <div className={styles.messageContent}>
                {!isMine && sender && (
                  <div className={styles.senderName}>{sender.username}</div>
                )}

                {msg.message && (
                  <p className={styles.messageText}>
                    {msg.message}
                    {(msg.edited || msg.updated_at) && (
                      <span className={styles.editedTag}> (modifié)</span>
                    )}
                  </p>
                )}

                {msg.file_url && (
                  <p className={styles.messageText}>
                    <a
                      href={`http://localhost:3000/files/${msg.file_url}`} // Correction ici
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileAttachment}
                    >
                      📎 {msg.file_url}
                    </a>
                  </p>
                )}

                <div className={styles.messageTime}>
                  {new Date(msg.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>

              {isMine && (
                <div className={styles.messageActions}>
                  <button
                    onClick={() => onEditStart(msg)}
                    title="Modifier"
                    className={styles.actionButton}
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
