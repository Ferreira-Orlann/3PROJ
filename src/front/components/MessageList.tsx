import React from "react";

const MessageList = ({ messages }: { messages: any[] }) => (
  <div>
    {messages.map((msg) => (
      <div key={msg.uuid}>
        <strong>{msg.source_uuid || "Utilisateur"}:</strong> {msg.message}
      </div>
    ))}
  </div>
);

export default MessageList;
