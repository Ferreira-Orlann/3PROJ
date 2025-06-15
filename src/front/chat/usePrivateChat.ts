import { useEffect, useState } from "react";
import { getPrivateMessages } from "../services/messagesService";
import { UUID } from "crypto";

export default function usePrivateChat(currentUserUuid: UUID, selectedUserUuid: UUID) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedUserUuid) return;
        setLoading(true);

        getPrivateMessages(currentUserUuid, selectedUserUuid).then((data) => {
            setMessages(data);
            setLoading(false);
          });
          
    }, [selectedUserUuid]);

    return { messages, loading };
}
