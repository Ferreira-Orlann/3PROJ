import { useNotifications } from "../hooks/useNotifications";
import authService from "../services/auth.service";
import "../styles/NotificationsPage.css";

const NotificationsPage = () => {
  const session = authService.getSession();

  if (!session) return <p>Utilisateur non connecté</p>;

  const userUuid = session.owner;

  const { notifications, loading, error } = useNotifications(userUuid);

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
              <li key={notif.uuid}>
                <p>{notif.content}</p>
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
