import type { User } from "../types/auth";
import styles from "../styles/privateChat.module.css";

interface Props {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

export default function UserList({ users, selectedUser, onSelectUser }: Props) {
  if (users.length === 0) {
    return <p className={styles.empty}>Aucun utilisateur trouvé</p>;
  }

  return (
    <ul className={styles.userList}>
      {users.map((user) => (
        <li
          key={user.uuid}
          className={`${styles.userItem} ${
            selectedUser?.uuid === user.uuid ? styles.activeUser : ""
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.username}>{user.username}</div>
              <div className={styles.status}>● En ligne</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
