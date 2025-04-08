import React from 'react';
import styles from '../../styles/chatList.module.css';

const ChatList = () => {
  const contacts = ['Alice', 'Bob', 'Charlie', 'Dev Team'];

  return (
    <div className={styles.chatList}>
      <h3>Conversations</h3>
      <ul>
        {contacts.map((name, i) => (
          <li key={i} className={styles.contact}>
            <strong>{name}</strong>
            <span className={styles.lastMessage}>Dernier message ici...</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;
