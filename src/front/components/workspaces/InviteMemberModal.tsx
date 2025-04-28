// src/front/components/workspaces/InviteMemberModal.tsx

import React, { useState } from 'react';
import styles from '../../styles/inviteMemberModal.module.css';

interface InviteMemberModalProps {
  onClose: () => void;
  onInvite: (email: string) => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ onClose, onInvite }) => {
  const [email, setEmail] = useState('');

  const handleInvite = () => {
    if (email.trim()) {
      onInvite(email);
      setEmail('');
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Inviter un membre</h2>
        <input
          type="email"
          placeholder="Email du membre"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className={styles.actions}>
          <button onClick={handleInvite}>Inviter</button>
          <button className={styles.cancel} onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
