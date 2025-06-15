// front/chat/ReplyPreview.tsx
import styles from "../styles/privateChat.module.css";

interface Message {
  uuid: string;
  message: string;
}

interface ReplyPreviewProps {
  replyTo: Message;
  onCancel: () => void;
}

export default function ReplyPreview({ replyTo, onCancel }: ReplyPreviewProps) {
  return (
    <div className={styles.replyPreviewBox}>
      <div className={styles.replyIndicator}>
        <div className={styles.replyLine} />
        <div className={styles.replyContent}>
          <span className={styles.replyLabel}>Réponse à :</span>
          <p className={styles.replyMessage}>
            {replyTo.message.length > 100
              ? replyTo.message.slice(0, 100) + "…"
              : replyTo.message}
          </p>
        </div>
      </div>
      <button
        className={styles.cancelReplyButton}
        onClick={onCancel}
        title="Annuler la réponse"
      >
        ×
      </button>
    </div>
  );
}
