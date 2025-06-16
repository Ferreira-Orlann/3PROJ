// components/MessageItem.tsx
import React from "react";
import { useReactions } from "../hooks/useReaction";
import { FaThumbsUp, FaHeart } from "react-icons/fa";
import authService from "../services/auth.service";
import { useUserName } from "../hooks/useUserName";

const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;

type Reaction = {
  emoji: string;
  userUuid: string;
};

type Message = {
  uuid: string;
  message: string;
  source: string;
  reactions?: Reaction[];
};

const MessageItem = ({ msg }: { msg: Message }) => {
  const currentUserUuid = authService.getSession().owner;
  const isMine = msg.source === currentUserUuid;
  const { addReaction } = useReactions(msg.uuid);
  const userName = useUserName(msg.source);

  const match = linkRegex.exec(msg.message);
  const content = match ? (
    <>
      📎 Fichier :{" "}
      <a
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#4da6ff", textDecoration: "underline" }}
      >
        {match[1]}
      </a>
    </>
  ) : (
    <>{msg.message}</>
  );

  // Grouper les réactions par emoji et compter
  const reactionCounts =
    msg.reactions?.reduce((acc: Record<string, number>, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {}) || {};

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isMine ? "flex-end" : "flex-start",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: isMine ? "#3b82f6" : "#40444b",
          color: "#fff",
          padding: "0.6rem 1rem",
          borderRadius: "18px",
          maxWidth: "60%",
          wordBreak: "break-word",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {!isMine && (
          <div
            style={{
              fontSize: "0.8rem",
              opacity: 0.7,
              marginBottom: "0.2rem",
            }}
          >
            {userName || "Utilisateur inconnu"}
          </div>
        )}
        <div>{content}</div>

        {/* Affichage des réactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
              Total réactions : {totalReactions}
            </div>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span
                  key={emoji}
                  style={{
                    backgroundColor: "#2c2f33",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "0.8rem",
                  }}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Boutons pour ajouter des réactions */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
        <button onClick={() => addReaction("👍", currentUserUuid)}>
          <FaThumbsUp color="#facc15" />
        </button>
        <button onClick={() => addReaction("❤️", currentUserUuid)}>
          <FaHeart color="#ef4444" />
        </button>
      </div>
    </div>
  );
};

export default MessageItem;
