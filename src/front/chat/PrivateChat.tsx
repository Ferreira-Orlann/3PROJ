// PrivateChat.tsx
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import userService from "../services/usersService";
import {
  getPrivateMessages,
  sendPrivateMessage,
  uploadFile,
  updatePrivateMessage,
} from "../services/messagesService";
import styles from "../styles/privateChat.module.css";

import UserList from "../chat/UserList";
import MessageList from "../chat/MessageList";
import ChatInput from "../chat/ChatInput";
import ReplyPreview from "../chat/ReplyPreview";
import type { User } from "../types/auth";

interface Message {
  uuid: string;
  message: string;
  source_uuid: string;
  destination_uuid: string;
  date: string;
  is_public: boolean;
  file_url?: string;
  reply_to_uuid?: string;
  edited?: boolean;
}

const PrivateChat = () => {
  const { session } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.token || !session?.owner) return;
      try {
        const allUsers = await userService.getAll(session.token);
        const filtered = allUsers.filter((u) => u.uuid !== session.owner.uuid);
        setUsers(filtered);
        setFilteredUsers(filtered);
      } catch {
        setError("Impossible de charger les utilisateurs.");
      }
    };
    fetchUsers();
  }, [session]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !session?.token) return;
      setLoadingMessages(true);
      try {
        console.log("Fetching messages for", selectedUser.uuid);
        const data = await getPrivateMessages(selectedUser.uuid, session.token);

        // Vérifie si data est un tableau (messages) ou un objet contenant un tableau
        const msgs = Array.isArray(data) ? data : data.messages || [];

        console.log("Messages received:", msgs);
        setMessages(msgs);
        setFilteredMessages(msgs);
        setError("");
      } catch (err) {
        console.error("Erreur lors de la récupération des messages:", err);
        setError("Erreur lors de la récupération des messages.");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser, session]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (selectedUser) {
      setFilteredMessages(
        messages.filter((msg) =>
          msg.message.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredMessages([]);
    }
  }, [searchTerm, users, messages, selectedUser]);

  const handleSend = async (
    messageText: string,
    fileToSend: File | null
  ) => {
    if ((!messageText.trim() && !fileToSend) || !selectedUser || !session?.owner || !session?.token) {
      return;
    }
    try {
      if (messageToEdit) {
        // Mise à jour du message existant via la fonction updatePrivateMessage
        await updatePrivateMessage(messageToEdit.uuid, messageText, session.token);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.uuid === messageToEdit.uuid
              ? { ...msg, message: messageText, edited: true }
              : msg
          )
        );
        setMessageToEdit(null);
      } else {
        let fileUrl: string | undefined = undefined;
        if (fileToSend) {
          fileUrl = await uploadFile(fileToSend, session.token);
        }
        const newMsg = await sendPrivateMessage(
          {
            message: messageText,
            is_public: false,
            source_uuid: session.owner.uuid,
            destination_uuid: selectedUser.uuid,
            reply_to_uuid: replyTo?.uuid,
            file_url: fileUrl,
          },
          session.token
        );
        setMessages((prev) => [...prev, newMsg]);
        setReplyTo(null);
      }
      setError("");
    } catch (e) {
      console.error("Erreur lors de l'envoi du message", e);
      setError("Erreur lors de l'envoi du message.");
    }
  };

  return (
    <div className={styles.chatContainer}>
      <aside className={styles.userSidebar}>
        <h2>Discussions privées</h2>
        <input
          type="text"
          placeholder="Rechercher utilisateur ou message..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {error && <p className={styles.error}>{error}</p>}
        <UserList
          users={filteredUsers}
          selectedUser={selectedUser}
          onSelectUser={(user) => {
            setSelectedUser(user);
            setReplyTo(null);
            setMessageToEdit(null);
          }}
        />
      </aside>

      <main className={styles.chatMain}>
        {!selectedUser ? (
          <div className={styles.emptyChatMessage}>
            <p>Sélectionnez un utilisateur pour discuter.</p>
          </div>
        ) : (
          <>
            <header className={styles.chatHeader}>
              Discussion avec <strong>{selectedUser.username}</strong>
            </header>

            <MessageList
              messages={filteredMessages}
              sessionUserUUID={session.owner?.uuid || ""}
              onReply={setReplyTo}
              onEdit={setMessageToEdit}
              allMessages={messages}
            />

            {replyTo && (
              <ReplyPreview
                replyTo={replyTo}
                onCancel={() => setReplyTo(null)}
              />
            )}

            <ChatInput
              onSend={handleSend}
              replyTo={replyTo}
              messageToEdit={messageToEdit}
              onCancelEdit={() => setMessageToEdit(null)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default PrivateChat;
