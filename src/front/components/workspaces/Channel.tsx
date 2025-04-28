// src/front/components/workspaces/Channel.tsx

import React, { useState } from 'react';
import styles from '../../styles/workspaceDetailPage.module.css';

interface ChannelProps {
  name: string;
}

const Channel = ({ name }: ChannelProps) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    console.log('Message envoyé:', message);
    setMessage('');
  };

  return (
    <div className={styles.channel}>
      <h3>{name}</h3>
      <div className={styles.messageBox}>
        <input
          type="text"
          placeholder={`Écrire dans #${name}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default Channel;
