import { useState, useEffect } from "react";
import { UUID } from "crypto";
import messageService, { Message } from "../services/api/endpoints/messages";
import userService, { User } from "../services/api/endpoints/users";
import { useAuth } from "../context/AuthContext";

export interface DirectMessageUser {
  uuid: UUID;
  username: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount?: number;
}

interface DirectMessagesState {
  users: DirectMessageUser[];
  isLoading: boolean;
  error: string | null;
}

export const useDirectMessages = () => {
  const auth = useAuth();
  const [state, setState] = useState<DirectMessagesState>({
    users: [],
    isLoading: false,
    error: null,
  });

  const extractUsersFromMessages = async (messages: Message[]): Promise<DirectMessageUser[]> => {
    if (!messages || messages.length === 0) return [];
    
    const currentUser = auth.user;
    if (!currentUser) return [];

    const userMap = new Map<string, DirectMessageUser>();
    
    for (const message of messages) {
      let otherUserUuid: UUID | null = null;
      
      if (message.destination_user) {
        if (typeof message.destination_user === 'object' && message.destination_user.uuid) {
          otherUserUuid = message.destination_user.uuid;
        } 
        else if (typeof message.destination_user === 'string') {
          otherUserUuid = message.destination_user as UUID;
        }
      }
      
      if (typeof message.source === 'object' && message.source.uuid) {
        if (message.source.uuid !== currentUser.uuid) {
          otherUserUuid = message.source.uuid;
        }
      }
      
      else if (typeof message.source === 'string' && message.source !== currentUser.uuid) {
        otherUserUuid = message.source as UUID;
      }
      
      if (otherUserUuid && !userMap.has(otherUserUuid.toString())) {
        try {
          const userData = await userService.getUserById(otherUserUuid);
          
          userMap.set(otherUserUuid.toString(), {
            uuid: otherUserUuid,
            username: userData.username,
            lastMessage: message.message,
            lastMessageDate: new Date(message.date),
            unreadCount: 0,
          });
        } catch (error) {
          console.error(`Error fetching user data for ${otherUserUuid}:`, error);
        }
      }
      
      if (otherUserUuid && userMap.has(otherUserUuid.toString())) {
        const user = userMap.get(otherUserUuid.toString());
        const messageDate = new Date(message.date);
        
        if (user && (!user.lastMessageDate || messageDate > user.lastMessageDate)) {
          userMap.set(otherUserUuid.toString(), {
            ...user,
            lastMessage: message.message,
            lastMessageDate: messageDate,
          });
        }
      }
    }
    
    return Array.from(userMap.values()).sort((a, b) => {
      if (!a.lastMessageDate) return 1;
      if (!b.lastMessageDate) return -1;
      return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
    });
  };

  const fetchDirectMessages = async () => {
    if (!auth.user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const allMessages = await messageService.getDirectMessages(auth.user.uuid as UUID);
      
      const users = await extractUsersFromMessages(allMessages);
      
      setState({
        users,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Impossible de récupérer les messages directs."
      }));
    }
  };

  useEffect(() => {
    if (auth.user) {
      fetchDirectMessages();
    }
  }, [auth.user]);

  return {
    state,
    refreshDirectMessages: fetchDirectMessages,
  };
};

export default useDirectMessages;
