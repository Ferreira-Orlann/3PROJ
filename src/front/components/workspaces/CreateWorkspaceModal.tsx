// src/front/components/workspaces/CreateWorkspaceModal.tsx

import React, { useState } from 'react';
import styles from '../../styles/workspacesPage.module.css';

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, visibility: string) => void;
}

const CreateWorkspaceModal = ({ onClose, onCreate }: CreateWorkspaceModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');

  const handleCreate = () => {
    onCreate(name, description, visibility); // Appeler la fonction de création
    onClose(); // Fermer le modal après la création
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Créer un nouvel espace de travail</h2>

        <input
          type="text"
          placeholder="Nom de l'espace"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="public">Public</option>
          <option value="private">Privé</option>
        </select>

        <div className={styles.modalButtons}>
          <button onClick={handleCreate} className={styles.createButton}>Créer</button>
          <button onClick={onClose} className={styles.cancelButton}>Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
