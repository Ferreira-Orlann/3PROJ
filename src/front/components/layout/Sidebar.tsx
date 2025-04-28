import React from "react";
import { Link } from "react-router-dom"; // Assure-toi que c’est bien là
import styles from "../../styles/sidebar.module.css";

const Sidebar = () => {
    const chats = ["Général", "Projet X", "Marketing", "Amis"];

    return (
        <div className={styles.sidebar}>
            <h2 className={styles.logo}>💬 SupChat</h2>
            <ul className={styles.chatList}>
                {chats.map((chat, index) => {
                    // 👉 si c’est "Général", on ajoute un lien vers "/"
                    if (chat === "Général") {
                        return (
                            <li key={index} className={styles.chatItem}>
                                <Link
                                    to="/"
                                    style={{
                                        color: "white",
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <div className={styles.avatar}>
                                        {chat.charAt(0)}
                                    </div>
                                    <span>{chat}</span>
                                </Link>
                            </li>
                        );
                    }

                    // 👉 les autres restent inchangés (ou on pourra faire des routes plus tard)
                    return (
                        <li key={index} className={styles.chatItem}>
                            <div className={styles.avatar}>
                                {chat.charAt(0)}
                            </div>
                            <span>{chat}</span>
                        </li>
                    );
                })}

                {/* Lien Notifications */}
                <li className={styles.chatItem}>
                    <Link
                        to="/notifications"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <div className={styles.avatar}>🔔</div>
                        <span>Notifications</span>
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
