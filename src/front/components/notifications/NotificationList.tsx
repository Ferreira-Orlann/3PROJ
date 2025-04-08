import React from 'react';
import './NotificationItem.css';

const notifications = [
  {
    id: 1,
    type: 'message',
    content: 'Alice t’a envoyé un message.',
    time: 'il y a 2 min',
  },
  {
    id: 2,
    type: 'mention',
    content: 'Tu as été mentionné dans #général.',
    time: 'il y a 10 min',
  },
  {
    id: 3,
    type: 'invitation',
    content: 'Bob t’a invité à rejoindre "Dev Team".',
    time: 'il y a 1h',
  },
];

const NotificationList = () => {
  return (
    <div className="notification-list">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification-item ${notif.type}`}>
          <div className="icon">{getIcon(notif.type)}</div>
          <div className="info">
            <p>{notif.content}</p>
            <span>{notif.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const getIcon = (type: string) => {
  switch (type) {
    case 'message':
      return '💬';
    case 'mention':
      return '@';
    case 'invitation':
      return '📩';
    default:
      return '🔔';
  }
};

export default NotificationList;
