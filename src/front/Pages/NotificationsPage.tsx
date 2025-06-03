import { useNotifications } from "../hooks/useNotifications";
import authService from "../services/auth.service";
import  notificationsService  from "../services/notifications.service";
import "../styles/NotificationsPage.css";

const NotificationsPage = () => {
  const session = authService.getSession();
  if (!session) return <p>Utilisateur non connecté</p>;

  const userUuid = session.owner;
  const { notifications, loading, error, setNotifications } = useNotifications(userUuid);

  const handleDelete = async (notificationUuid: string) => {
    try {
      await notificationsService.deleteNotification(userUuid, notificationUuid);
      setNotifications((prev) =>
        prev.filter((n) => n.uuid !== notificationUuid)
      );
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Échec de la suppression de la notification.");
    }
  };

  if (loading) return <p>Chargement des notifications...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="notifications-container">
      <div className="notifications-box">
        <h1>Vos notifications</h1>
        {notifications.length === 0 ? (
          <p>Aucune notification</p>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notif) => (
              <li key={notif.uuid} className="notification-item">
                <div className="notification-content">
                  <p>{notif.content}</p>
                  <small>{new Date(notif.created_at).toLocaleString()}</small>
                </div>
                <button
                  onClick={() => handleDelete(notif.uuid)}
                  className="delete-button"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
