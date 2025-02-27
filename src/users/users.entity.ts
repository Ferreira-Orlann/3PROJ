import { Entity, OneToMany } from "typeorm";
import { UUID } from "crypto";
import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./users.status.enum";
import { Workspace } from "src/workspaces/workspaces.entity";
import { WorkspaceMember } from "src/workspaces/members/workspace_members.entity";
import { Channel } from "../channels/channels.entity";
import { Session } from "src/authentication/session.entity";
import { Message } from "src/messages/messages.entity";
import { Reaction } from "../reactions/reaction.entity";

@Entity({
    name: "users",
})
export class User {
    @PrimaryGeneratedColumn("uuid")
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
    ownedWorkspaces: Promise<Workspace[]>;

    @OneToMany(() => WorkspaceMember, (member) => member.user)
    workspace_members: Promise<WorkspaceMember[]>;

    @OneToMany(() => Channel, (channel) => channel.creator)
    createdChannels: Promise<Channel[]>;

    @OneToMany(() => Session, (session) => session.owner)
    sessions: Promise<Session[]>;

    @OneToMany(() => Message, (message) => message.source)
    createdMessage: Promise<Message[]>;

    @OneToMany(() => Reaction, (reaction) => reaction.user)
    createdReaction: Promise<Reaction[]>;
}
