import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings as SettingsIcon } from 'lucide-react';
import styles from '../styles/workspaceDetailPage.module.css';
import Channel from '../components/workspaces/Channel';
import Member from '../components/workspaces/Member';
import InviteMemberModal from '../components/workspaces/InviteMemberModal';

const WorkspaceDetailPage = () => {
  const { state } = useLocation();
  const workspace = state;

  const [activeTab, setActiveTab] = useState<'channels' | 'members' | 'settings'>('channels');
  const [activeChannel, setActiveChannel] = useState<string | null>(null); // Canal actif sélectionné
  const [messages, setMessages] = useState<{ [channel: string]: any[] }>({}); // Messages par canal
  const [newMessage, setNewMessage] = useState<string>(''); // Message à envoyer
  const [file, setFile] = useState<File | null>(null); // Fichier à envoyer
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [activeChannels, setActiveChannels] = useState<{ [channel: string]: boolean }>({}); // Etat des canaux ouverts/fermés
  const [showEmojiPopup, setShowEmojiPopup] = useState<boolean>(false); // Pour contrôler la pop-up des emojis
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number | null>(null); // Message sélectionné pour la réaction

  // Fonction pour gérer l'ouverture/fermeture d'un canal
  const toggleChannel = (channel: string) => {
    setActiveChannels(prev => ({
      ...prev,
      [channel]: !prev[channel], // Si ouvert, ferme; si fermé, ouvre
    }));
    setActiveChannel(channel); // Mettre à jour le canal actif
  };

  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!activeChannel || newMessage.trim() === '') return;

    // Ajout du message au canal actif
    setMessages(prevMessages => ({
      ...prevMessages,
      [activeChannel]: [
        ...(prevMessages[activeChannel] || []),
        { text: newMessage, user: 'Moi', reactions: [], type: 'text' },
      ],
    }));

    // Réinitialisation du champ de message
    setNewMessage('');
  };

  // Fonction pour envoyer un fichier
  const handleSendFile = () => {
    if (!activeChannel || !file) return;

    // Ajout du fichier au canal actif
    setMessages(prevMessages => ({
      ...prevMessages,
      [activeChannel]: [
        ...(prevMessages[activeChannel] || []),
        { text: `Fichier envoyé: ${file.name}`, user: 'Moi', reactions: [], type: 'file' },
      ],
    }));

    // Réinitialisation du fichier
    setFile(null);
  };

  // Fonction pour ajouter une réaction à un message
  const handleReactToMessage = (channel: string, messageIndex: number, reaction: string) => {
    setMessages(prevMessages => {
      const updatedMessages = [...(prevMessages[channel] || [])];
      const message = updatedMessages[messageIndex];
      if (!message.reactions) message.reactions = [];

      message.reactions.push(reaction);

      return {
        ...prevMessages,
        [channel]: updatedMessages,
      };
    });
    setShowEmojiPopup(false); // Ferme la pop-up après avoir réagi
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'channels':
        return (
          <div className={styles.contentList}>
            {workspace.channels.map((channel: string, index: number) => (
              <div key={index}>
                <div
                  className={styles.channelItem}
                  onClick={() => toggleChannel(channel)} // Cliquer pour ouvrir/fermer
                >
                  <Channel name={channel} />
                </div>

                {/* Affichage du chat si le canal est ouvert */}
                {activeChannels[channel] && activeChannel === channel && (
                  <div className={styles.chatBox}>
                    <h3>Chat du canal : {channel}</h3>
                    <div className={styles.messagesContainer}>
                      {/* Messages fictifs */}
                      {[
                        { text: 'Bonjour à tous!', user: 'Alice', reactions: ['👍'], type: 'text' },
                        { text: 'Comment ça va ?', user: 'Bob', reactions: ['❤️'], type: 'text' },
                        { text: 'Voici un fichier important.', user: 'Moi', reactions: [], type: 'file' },
                      ].concat(messages[channel] || []).map((message, index) => (
                        <div
                          key={index}
                          className={styles.message}
                          onMouseEnter={() => setCurrentMessageIndex(index)} // Montrer pop-up au survol
                          onMouseLeave={() => setCurrentMessageIndex(null)} // Cacher la pop-up après le survol
                        >
                          <div>
                            <strong>{message.user}</strong>: {message.type === 'file' ? <i>{message.text}</i> : <p>{message.text}</p>}
                          </div>

                          {/* Affichage des réactions */}
                          {currentMessageIndex === index && (
                            <div className={styles.reactionsPopup}>
                              {['👍', '❤️', '😂'].map((reaction) => (
                                <span
                                  key={reaction}
                                  className={styles.reactionButton}
                                  onClick={() => handleReactToMessage(activeChannel, index, reaction)}
                                >
                                  {reaction}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className={styles.reactionsList}>
                            {message.reactions && message.reactions.join(' ')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Barre de saisie unique */}
                    <div className={styles.inputContainer}>
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className={styles.input}
                        placeholder="Tapez un message..."
                      />
                      <div className={styles.inputActions}>
                        <input
                          type="file"
                          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                          className={styles.fileInput}
                        />
                        <button onClick={handleSendMessage} className={styles.sendButton}>
                          Envoyer
                        </button>
                        <button onClick={handleSendFile} className={styles.sendFileButton}>
                          Envoyer un fichier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'members':
        return (
          <div className={styles.contentList}>
            {/* Ici tu devrais afficher les vrais membres du workspace */}
            <Member name="Jean Dupont" />
            <Member name="Marie Martin" />
          </div>
        );
      case 'settings':
        return (
          <div className={styles.settingsContent}>
            <form>
              <div className={styles.formGroup}>
                <label>Nom</label>
                <input type="text" defaultValue={workspace.name} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea defaultValue={workspace.description}></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Visibilité</label>
                <select defaultValue={workspace.visibility}>
                  <option value="Public">Public</option>
                  <option value="Privé">Privé</option>
                </select>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header workspace */}
      <div className={styles.header}>
        <div className={styles.workspaceIcon}>{workspace.icon}</div>
        <h1>{workspace.name}</h1>
        <p>{workspace.description}</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('channels')} className={activeTab === 'channels' ? styles.activeTab : ''}>
          <MessageSquare /> Canaux
        </button>
        <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? styles.activeTab : ''}>
          <Users /> Membres
        </button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? styles.activeTab : ''}>
          <SettingsIcon /> Paramètres
        </button>
      </div>

      {/* Content */}
      <div className={styles.tabContent}>
        {renderContent()}
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(email) => console.log('Invité :', email)}
        />
      )}
    </div>
  );
};

export default WorkspaceDetailPage;
