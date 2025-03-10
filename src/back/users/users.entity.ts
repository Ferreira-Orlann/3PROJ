import { Entity, OneToMany } from "typeorm";
import { UUID } from "crypto";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./users.status.enum";
import { Workspace } from "../workspaces/workspaces.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";
import { Channel } from "../channels/channels.entity";
import { Session } from "../authentication/session.entity";
import { Message } from "../messages/messages.entity";
import { Reaction } from "../reactions/reactions.entity";
import { Exclude } from "class-transformer";

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

    @Exclude()
    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Promise<Workspace[]>;

    @Exclude()
    @OneToMany(() => WorkspaceMember, (member) => member.user)
    workspace_members: Promise<WorkspaceMember[]>;

    @Exclude()
    @OneToMany(() => Channel, (channel) => channel.creator)
    createdChannels: Promise<Channel[]>;

    @Exclude()
    @OneToMany(() => Session, (session) => session.owner)
    sessions: Promise<Session[]>;

    @Exclude()
    @OneToMany(() => Message, (message) => message.source)
    createdMessage: Promise<Message[]>;

    @Exclude()
    @OneToMany(() => Reaction, (reaction) => reaction.user)
    createdReaction: Promise<Reaction[]>;
}
