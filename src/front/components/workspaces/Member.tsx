// src/front/components/workspaces/Member.tsx

import React from "react";
import styles from "../../styles/workspaceDetailPage.module.css";

interface MemberProps {
    name: string;
    uuid: string; // Ajout

}

const Member = ({ name }: MemberProps) => (
    <div className={styles.member}>
        <p>{name}</p>
    </div>
);

export default Member;
