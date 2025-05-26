// MessageList.tsx
import { useEffect, useRef } from "react";
import styles from "../styles/privateChat.module.css";

interface Message {
  uuid: string;
  message: string;
  source_uuid: string;
  destination_uuid: string;
  date: string;
  is_public: boolean;
  file_url?: string;
  reply_to_uuid?: string;
  edited?: boolean;
}

interface Props {
  messages: Message[];
  sessionUserUUID?: string;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  allMessages: Message[];
}

export default function MessageList({
  messages,
  sessionUserUUID,
  onReply,
  onEdit,
  allMessages,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.messageScroll}>
      {messages.length === 0 ? (
        <p className={styles.empty}>Aucun message correspondant</p>
      ) : (
        messages.map((msg) => {
          const isMine = msg.source_uuid === sessionUserUUID;
          const repliedMsg = msg.reply_to_uuid
            ? allMessages.find((m) => m.uuid === msg.reply_to_uuid)
            : null;

          return (
            <div
              key={msg.uuid}
              className={`${styles.messageBubble} ${
                isMine ? styles.sent : styles.received
              }`}
            >
              {repliedMsg && (
                <div className={styles.replyPreview}>
                  <small>
                    Réponse à:{" "}
                    {repliedMsg.message.length > 50
                      ? repliedMsg.message.slice(0, 50) + "..."
                      : repliedMsg.message}
                  </small>
                </div>
              )}
              <p>
                {msg.message}
                {msg.edited && <span className={styles.editedTag}> (modifié)</span>}
              </p>

              {msg.file_url && (
                <a
                  href={msg.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.fileLink}
                >
                  📎 Fichier joint
                </a>
              )}

            <div className={styles.messageActions}>
            { (
                <button
                className={styles.actionButton}
                onClick={() => onEdit(msg)}
                title="Modifier"
                >
                ✏️
                </button>
  )}
</div>

            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
