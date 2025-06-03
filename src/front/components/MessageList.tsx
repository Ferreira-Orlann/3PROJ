import React, { useEffect, useRef } from "react";
import authService from "../services/auth.service"; // Pour récupérer l'utilisateur actuel

const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;

const MessageList = ({ messages }: { messages: any[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserUuid = authService.getSession().owner; // ← Ton UUID utilisateur

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("Messages reçus :", messages);
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        overflowY: "auto",
        height: "100%",
      }}
    >
      {messages.map((msg) => {
        if (!msg) return null;

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
          msg.message
        );

        const isMine = msg.source === currentUserUuid;
        console.log("Message source UUID :", msg.source);
        console.log("Current user UUID :", currentUserUuid);
        console.log("Is mine:", isMine);
        return (
          <div
            key={msg.uuid}
            style={{
              display: "flex",
              justifyContent: isMine ? "flex-end" : "flex-start",
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
                <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.2rem" }}>
                  {msg.source || "Utilisateur"}
                </div>
              )}
              <div>{content}</div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
