import React, { useState, useEffect, useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { usePrivateChat } from "../hooks/usePrivateChat";
import userService from "../services/usersService";
import UserList from "../chat/UserList";
import MessageList from "../chat/MessageList";
import ChatInput from "../chat/ChatInput";
import { deletePrivateMessage, updatePrivateMessage, uploadFile } from "../services/messagesService";
import styles from "../styles/privateChat.module.css";
import type { User } from "../types/auth";
import type { Message } from "../types/messages";

export default function PrivateChat() {
  const { session } = useAuthContext();
  const me = session!.owner.uuid;
  const token = session!.token;

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  const {
    messages,
    sendMessage,
    updateMessage,
    deleteMessage,
    fetchMessages
  } = usePrivateChat(me, token, selectedUser?.uuid ?? null);

  useEffect(() => {
    userService.getAll(token).then((u) => setUsers(u.filter((x) => x.uuid !== me)));
  }, [token, me]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(term));
  }, [users, searchTerm]);

  const handleSend = async (text: string, file?: File) => {
    try {
      const fileUrl = file ? await uploadFile(file, token) : undefined;

      if (editingMessage) {
        await updatePrivateMessage(me, editingMessage.uuid, {
          message: text,
          file_url: fileUrl ?? editingMessage.file_url,
        }, token);
        setEditingMessage(null);
      } else {
        await sendMessage(text, fileUrl, replyTo?.uuid);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi ou modification du message :", err);
    }

    setReplyTo(null);
  };

  const handleDelete = async (msg: Message) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;
    try {
      await deletePrivateMessage(me, msg.uuid, token);
    } catch (err) {
      console.error("Erreur lors de la suppression du message :", err);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <aside className={styles.userSidebar}>
        <h2>Discussions privées</h2>
        <input
          placeholder="Rechercher utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <UserList
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(u) => {
            setSelectedUser(u);
            setReplyTo(null);
            setEditingMessage(null);
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
              selectedUserUuid={selectedUser.uuid}
              users={users}
              onEditStart={setEditingMessage}
            />

            <ChatInput
              onSend={handleSend}
              editingMessage={editingMessage}
              onCancelEdit={() => setEditingMessage(null)}
            />
          </>
        )}
      </main>
    </div>
  );
}
