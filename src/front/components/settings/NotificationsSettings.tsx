
import React from "react";
import styles from "../../styles/notificationsSettings.module.css"; 

const NotificationsSettings = () => {
  return (
    <div className={styles.container}>
      <h2>Paramètres de Notifications</h2>
      <p>Cette section vous permet de gérer vos paramètres de notifications.</p>

      {}
      <div className={styles.notificationOption}>
        <label htmlFor="emailNotifications">Notifications par Email</label>
        <input
          type="checkbox"
          id="emailNotifications"
          name="emailNotifications"
          defaultChecked={true}
        />
      </div>

      <div className={styles.notificationOption}>
        <label htmlFor="pushNotifications">Notifications Push</label>
        <input
          type="checkbox"
          id="pushNotifications"
          name="pushNotifications"
          defaultChecked={true}
        />
      </div>

      {/* D'autres options de notification peuvent être ajoutées ici */}
    </div>
  );
};

export default NotificationsSettings;
