import React from 'react';
import styles from '../../styles/chatWindow.module.css';

const ChatWindow = () => {
  return (
    <div className={styles.chatWindow}>
      <div className={styles.messages}>
        <div className={styles.message + ' ' + styles.sender}>
          Salut, comment ça va ?
        </div>
        <div className={styles.message + ' ' + styles.receiver}>
          Très bien et toi ? 🔥
        </div>
      </div>
      <div className={styles.inputArea}>
        <input type="text" placeholder="Écris un message..." />
        <button>Envoyer</button>
      </div>
    </div>
  );
};

export default ChatWindow;
