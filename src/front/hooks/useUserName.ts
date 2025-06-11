import { useState, useEffect, useRef } from "react";

const userCache: Record<string, string> = {};

export function useUserName(uuid: string | undefined) {
  const [userName, setUserName] = useState<string>("Utilisateur inconnu");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!uuid) {
      setUserName("Utilisateur inconnu");
      return;
    }

    if (userCache[uuid]) {
      setUserName(userCache[uuid]);
      return;
    }

    // Utilise bien le bon endpoint
    fetch(`http://localhost:3000/users/uuid/${uuid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then((data) => {
        console.log("Réponse utilisateur:", data);
        if (isMounted.current && data?.username) {
          userCache[uuid] = data.username;
          setUserName(data.username);
        }
      })
      .catch((err) => {
        console.error("Erreur fetch user:", err);
        if (isMounted.current) setUserName("Utilisateur inconnu");
      });

    return () => {
      isMounted.current = false;
    };
  }, [uuid]);

  return userName;
}
