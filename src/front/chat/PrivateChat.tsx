import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import userService from "../services/usersService";
import {
  getPrivateMessages,
  sendPrivateMessage,
  uploadFile,
} from "../services/messagesService";
import styles from "../styles/privateChat.module.css";
import type { User } from "../types/auth";

import UserList from "../chat/UserList";
import MessageList from "../chat/MessageList";
import ChatInput from "../chat/ChatInput";
import ReplyPreview from "../chat/ReplyPreview";
import { UUID } from "crypto";

interface Message {
  uuid: UUID;
  message: string;
  source_uuid: UUID;
  destination_uuid: UUID;
  date: string;
  is_public: boolean;
  file_url?: string;
  reply_to_uuid?: string;
  edited?: boolean;
}

const PrivateChat = () => {
  const { session, user } = useAuthContext();
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


  // Chargement des utilisateurs
  useEffect(() => {
    console.log("user",user)
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

  // Chargement des messages privés de l'utilisateur sélectionné
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !session?.token) return;
      setLoadingMessages(true);
      try {
        const data = await getPrivateMessages(selectedUser.uuid, session.token);
        console.log("selectUser",data)
        setMessages(data);
        setFilteredMessages(data);
        setError("");
      } catch {
        setError("Erreur lors de la récupération des messages.");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [selectedUser, session]);

  // Filtrer utilisateurs et messages selon searchTerm
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

  // Envoi d'un message (texte + optionnel fichier)
  const handleSend = async (
    messageText: string,
    fileToSend: File | null
  ) => {
    if ((!messageText.trim() && !fileToSend) || !selectedUser || !session?.owner || !session?.token) {
      return;
    }
    try {
      let fileUrl: string | undefined = undefined;
      if (fileToSend) {
        fileUrl = await uploadFile(fileToSend, session.token);
      }

      console.log("session",session)
      const newMsg = await sendPrivateMessage(
        {
          message: messageText,
          is_public: false,
          source_uuid: user.uuid,
          destination_uuid: selectedUser.uuid,
          
          file_url: fileUrl,
        },
        session.token
      );
      setMessages((prev) => [...prev, newMsg]);
      setReplyTo(null);
      setError("");
    } catch {
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
            onReply={(msg) => setReplyTo(msg)}
            onEdit={() => {}}  // <-- AJOUTÉ ici
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
