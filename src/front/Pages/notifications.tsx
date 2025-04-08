import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import NotificationList from '../components/notifications/NotificationList';
import '../styles/notifications.css';

const NotificationsPage = () => {
  return (
    <div className="notifications-container">
      <Sidebar />
      <div className="notifications-main">
        <h2>🔔 Notifications</h2>
        <NotificationList />
      </div>
    </div>
  );
};

export default NotificationsPage;
