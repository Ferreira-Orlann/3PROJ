// src/pages/WorkspaceDetailPage.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, Users, Settings as SettingsIcon } from "lucide-react";
import styles from "../styles/workspaceDetailPage.module.css";
import Channel from "../components/workspaces/Channel";
import Member from "../components/workspaces/Member";
import InviteMemberModal from "../components/workspaces/InviteMemberModal";

const WorkspaceDetailPage = () => {
    const { state } = useLocation();
    const workspace = state;

    const [activeTab, setActiveTab] = useState<"channels" | "members" | "settings">("channels");
    const [activeChannel, setActiveChannel] = useState<string | null>(null);
    const [messages, setMessages] = useState<{ [channel: string]: any[] }>({});
    const [newMessage, setNewMessage] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
    const [currentMessageIndex, setCurrentMessageIndex] = useState<number | null>(null);

    const handleChannelClick = (channel: string) => {
        setActiveChannel(channel);
    };

    const handleSendMessage = () => {
        if (!activeChannel || newMessage.trim() === "") return;

        setMessages((prev) => ({
            ...prev,
            [activeChannel]: [
                ...(prev[activeChannel] || []),
                { text: newMessage, user: "Moi", reactions: [], type: "text" },
            ],
        }));
        setNewMessage("");
    };

    const handleSendFile = () => {
        if (!activeChannel || !file) return;

        setMessages((prev) => ({
            ...prev,
            [activeChannel]: [
                ...(prev[activeChannel] || []),
                {
                    text: `Fichier envoyé: ${file.name}`,
                    user: "Moi",
                    reactions: [],
                    type: "file",
                },
            ],
        }));

        setFile(null);
    };

    const handleReactToMessage = (channel: string, index: number, reaction: string) => {
        setMessages((prev) => {
            const updated = [...(prev[channel] || [])];
            const msg = updated[index];
            msg.reactions = [...(msg.reactions || []), reaction];
            return { ...prev, [channel]: updated };
        });
    };

    const renderChannels = () => (
        <div className={styles.sidebar}>
            {workspace.channels.map((channel: string, index: number) => (
                <div key={index} onClick={() => handleChannelClick(channel)} className={styles.channelItem}>
                    <Channel name={channel} />
                </div>
            ))}
        </div>
    );

    const renderChat = () => {
        if (!activeChannel) {
            return <div className={styles.chatPlaceholder}>Sélectionnez un canal pour discuter</div>;
        }

        const allMessages = [
            { text: "Bonjour à tous!", user: "Alice", reactions: ["👍"], type: "text" },
            { text: "Comment ça va ?", user: "Bob", reactions: ["❤️"], type: "text" },
            { text: "Voici un fichier important.", user: "Moi", reactions: [], type: "file" },
            ...(messages[activeChannel] || []),
        ];

        return (
            <div className={styles.chatBox}>
                <h3>Canal : {activeChannel}</h3>
                <div className={styles.messagesContainer}>
                    {allMessages.map((msg, index) => (
                        <div
                            key={index}
                            className={styles.message}
                            onMouseEnter={() => setCurrentMessageIndex(index)}
                            onMouseLeave={() => setCurrentMessageIndex(null)}
                        >
                            <div>
                                <strong>{msg.user}</strong>:{" "}
                                {msg.type === "file" ? <i>{msg.text}</i> : <p>{msg.text}</p>}
                            </div>
                            {currentMessageIndex === index && (
                                <div className={styles.reactionsPopup}>
                                    {["👍", "❤️", "😂"].map((emoji) => (
                                        <span
                                            key={emoji}
                                            className={styles.reactionButton}
                                            onClick={() => handleReactToMessage(activeChannel, index, emoji)}
                                        >
                                            {emoji}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className={styles.reactionsList}>
                                {msg.reactions && msg.reactions.join(" ")}
                            </div>
                        </div>
                    ))}
                </div>

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
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
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
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case "channels":
                return (
                    <div className={styles.mainContent}>
                        {renderChannels()}
                        {renderChat()}
                    </div>
                );
            case "members":
                return (
                    <div className={styles.contentList}>
                        <Member name="Jean Dupont" />
                        <Member name="Marie Martin" />
                    </div>
                );
            case "settings":
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
            <div className={styles.header}>
                <div className={styles.workspaceIcon}>{workspace.icon}</div>
                <h1>{workspace.name}</h1>
                <p>{workspace.description}</p>
            </div>

            <div className={styles.tabs}>
                <button onClick={() => setActiveTab("channels")} className={activeTab === "channels" ? styles.activeTab : ""}>
                    <MessageSquare /> Canaux
                </button>
                <button onClick={() => setActiveTab("members")} className={activeTab === "members" ? styles.activeTab : ""}>
                    <Users /> Membres
                </button>
                <button onClick={() => setActiveTab("settings")} className={activeTab === "settings" ? styles.activeTab : ""}>
                    <SettingsIcon /> Paramètres
                </button>
            </div>

            <div className={styles.tabContent}>{renderContent()}</div>

            {showInviteModal && (
                <InviteMemberModal
                    onClose={() => setShowInviteModal(false)}
                    onInvite={(email) => console.log("Invité :", email)}
                />
            )}
        </div>
    );
};

export default WorkspaceDetailPage;
