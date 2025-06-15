// src/front/context/PrivateChatContext.tsx
import { createContext, useContext, useState } from "react";

const PrivateChatContext = createContext(null);

export function PrivateChatProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // Simule le currentUser — à remplacer par le vrai utilisateur connecté
  const currentUser = { uuid: "current-user-uuid", name: "Moi" };

  return (
    <PrivateChatContext.Provider
      value={{
        selectedUser,
        selectUser: setSelectedUser,
        currentUser,
      }}
    >
      {children}
    </PrivateChatContext.Provider>
  );
}

export const usePrivateChat = () => useContext(PrivateChatContext);
