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
  allMessages: Message[];
  sessionUserUUID: string;
  onReply: (m: Message) => void;
  onEdit: (m: Message) => void;
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
        <p className={styles.empty}>Aucun message</p>
      ) : (
        messages.map((msg) => {
          const isMine = msg.source_uuid === sessionUserUUID;
          const repliedMsg = msg.reply_to_uuid
            ? allMessages.find((m) => m.uuid === msg.reply_to_uuid)
            : null;

          const key = msg.uuid || `${msg.source_uuid}-${msg.date}`;

          return (
            <div
              key={key}
              className={`${styles.messageBubble} ${
                isMine ? styles.sent : styles.received
              }`}
            >
              {/* Réponse à un autre message */}
              {repliedMsg && (
                <div className={styles.replyPreview}>
                  <small>
                    Réponse à :{" "}
                    {repliedMsg.message.length > 50
                      ? repliedMsg.message.slice(0, 50) + "..."
                      : repliedMsg.message}
                  </small>
                </div>
              )}

              {/* Corps du message */}
              {msg.message && (
                <p>
                  {msg.message}
                  {msg.edited && (
                    <span className={styles.editedTag}> (modifié)</span>
                  )}
                </p>
              )}

              {/* Fichier joint */}
              {msg.file_url && (
                <div className={styles.attachmentPreview}>
                  {/\.(jpeg|jpg|png|gif|webp)$/i.test(msg.file_url) ? (
                    <img
                      src={msg.file_url}
                      alt="Pièce jointe"
                      className={styles.imageAttachment}
                    />
                  ) : (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.fileLink}
                    >
                      📎 {msg.file_url.split("/").pop()}
                    </a>
                  )}
                </div>
              )}

              {/* Heure d'envoi */}
              <div className={styles.messageTime}>
                {new Date(msg.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Actions */}
              <div className={styles.messageActions}>
                <button
                  className={styles.actionButton}
                  onClick={() => onEdit(msg)}
                  title="Modifier"
                >
                  ✏️
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => onReply(msg)}
                  title="Répondre"
                >
                  🔁
                </button>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
