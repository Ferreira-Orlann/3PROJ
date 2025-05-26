import React, { useEffect, useRef } from "react";

const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;

const MessageList = ({ messages }: { messages: any[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

    // 🔍 Log pour voir tout le tableau messages
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
        // 🔍 Log pour voir chaque message individuellement
        console.log("Message :", msg);

        const match = linkRegex.exec(msg.message);

        let content;

        if (match) {
          content = (
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
          );
        } else {
          content = msg.message;
        }

        return (
          <div
            key={msg.uuid}
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                backgroundColor: "#40444b",
                color: "#fff",
                padding: "0.6rem 1rem",
                borderRadius: "18px",
                maxWidth: "60%",
                wordBreak: "break-word",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.2rem" }}>
                {msg.source || "Utilisateur"}
              </div>
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
