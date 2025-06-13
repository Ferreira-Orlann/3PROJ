// src/components/PrivateChat.tsx
import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import {usePrivateChat} from "../hooks/usePrivateChat";
import userService from "../services/usersService";
import UserList from "../chat/UserList";
import MessageList from "../chat/MessageList";
import ChatInput from "../chat/ChatInput";
import ReplyPreview from "../chat/ReplyPreview";
import styles from "../styles/privateChat.module.css";
import { uploadFile } from "../services/messagesService";

export default function PrivateChat() {
  const { session } = useAuthContext();
  const me = session!.owner.uuid;
  const token = session!.token;

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const { messages, sendMessage } = usePrivateChat(me, token, selectedUser?.uuid);

  React.useEffect(() => {
    userService.getAll(token).then((u) => setUsers(u.filter((x) => x.uuid !== me)));
  }, [token, me]);

  const [replyTo, setReplyTo] = useState(null);

  return (
    <div className={styles.chatContainer}>
      <aside className={styles.userSidebar}>
        <h2>Discussions privées</h2>
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelectUser={(u) => {
            setSelectedUser(u);
            setReplyTo(null);
          }}
        />
      </aside>
      <main className={styles.chatMain}>
        {!selectedUser ? (
          <p className={styles.emptyChatMessage}>Sélectionnez un utilisateur.</p>
        ) : (
          <>
            <header className={styles.chatHeader}>
              Chat avec <strong>{selectedUser.username}</strong>
            </header>
            <MessageList
            messages={messages}
            sessionUserUUID={me}
            onReply={setReplyTo}
            onEdit={() => {}}
            allMessages={messages}
            />

            {replyTo && <ReplyPreview replyTo={replyTo} onCancel={() => setReplyTo(null)} />}
            <ChatInput
              onSend={async (text, file) => {
                const fileUrl = file ? await uploadFile(file, token) : undefined;
                sendMessage(text, fileUrl, replyTo?.uuid);
                setReplyTo(null);
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
