// src/pages/ChannelPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

const ChannelPage = () => {
  const { uuid: workspaceUuid, channelId } = useParams();

  const { messages, loading, error, sendMessage } = useMessages(workspaceUuid!, channelId!);

  return (
    <div style={{ padding: "1rem", color: "white" }}>
      <h1>Canal : {channelId}</h1>
      {loading && <p>Chargement...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
};

export default ChannelPage;
