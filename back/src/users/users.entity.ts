import { Entity, ManyToOne, OneToMany } from "typeorm";
import { UUID } from "crypto";
import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./users.status.enum";
import { Workspace } from "src/workspaces/workspaces.entity";
import { WorkspaceMember } from "src/workspaces/members/workspace_members.entity";
import { Messaging } from "../messagings/messagings.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    username: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    address: string;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.OFFLINE,
    })
    status: UserStatus;

    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Workspace[];

    @OneToMany(() => WorkspaceMember, (member) => member.user)
    workspace_members: WorkspaceMember[]

    @OneToMany(() => Messaging, (Messaging) => Messaging.user)
    messaging: Messaging[];
}
