import { useEffect, useState } from "react";
import notificationsService from "../services/notifications.service";

export const useNotifications = (userUuid: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsService.getUserNotifications(userUuid);
        setNotifications(data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des notifications", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
      const data = await notificationsService.getUserNotifications(userUuid);
console.log("Notifications reçues :", data);
setNotifications(data);

    };

    fetchNotifications();
  }, [userUuid]);

  return { notifications, loading, error };
};
