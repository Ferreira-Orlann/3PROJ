import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem"; // <– importe ton nouveau composant

const MessageList = ({ messages }: { messages: any[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      {messages.map((msg) => msg && <MessageItem key={msg.uuid} msg={msg} />)}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
