import React from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../hooks/useMessages";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import authService from "../services/auth.service";

const ChannelPage = () => {
  const { uuid: workspaceUuid, channelId } = useParams();
  const { messages, loading, error, sendMessage } = useMessages(workspaceUuid!, channelId!);
  const session = authService.getSession();
  const userUuid = session?.owner;
  console.log("User UUID channelpage:", userUuid);

  return (
    <div
      style={{
        height: "calc(100vh - 50px)", 
        display: "flex",
        flexDirection: "column",
        
      }}
    >
      <div style={{ padding: "1rem" }}>
        <h1>Canal : {channelId}</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 1rem" }}>
        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        <MessageList messages={messages} />
      </div>

      <div style={{ padding: "1rem", borderTop: "1px solid #333" }}>
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
};

export default ChannelPage;
