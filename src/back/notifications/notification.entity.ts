import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";
import { Message } from "../messages/messages.entity";
import { Workspace } from "../workspaces/workspaces.entity";
import { Reaction } from "../reactions/reactions.entity";
import { Exclude, Expose, Transform } from "class-transformer";

export enum NotificationType {
    MESSAGE_RECEIVED = "message_received",
    REACTION_RECEIVED = "reaction_received",
    CHANNEL_REACTION = "channel_reaction",
    WORKSPACE_ADDED = "workspace_added",
    WORKSPACE_INVITATION = "workspace_invitation",
}

@Entity({
    name: "notifications",
})
export class Notification {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @Column({
        type: "enum",
        enum: NotificationType,
    })
    @Expose()
    type: NotificationType;

    @Column({ default: false })
    @Expose()
    read: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    @Expose()
    created_at: Date;

    @Transform(({ value }) => (value ? value.uuid : null))
    @Expose()
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({
        name: "recipient_uuid",
        referencedColumnName: "uuid",
    })
    recipient: User;

    @Transform(({ value }) => (value ? value.uuid : null))
    @Expose()
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({
        name: "sender_uuid",
        referencedColumnName: "uuid",
    })
    sender: User | null;

    @ManyToOne(() => Message, (message) => message.notifications, { nullable: true })
    @Expose()
    @JoinColumn({
        name: "message_uuid",
        referencedColumnName: "uuid",
    })
    message: Message | null;

    @ManyToOne(() => Channel, (channel) => channel.notifications, { nullable: true })
    @Expose()
    @JoinColumn({
        name: "channel_uuid",
        referencedColumnName: "uuid",
    })
    channel: Channel | null;

    @ManyToOne(() => Workspace, (workspace) => workspace.notifications, { nullable: true })
    @Expose()
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace | null;

    @ManyToOne(() => Reaction, (reaction) => reaction.notifications, { nullable: true })
    @Expose()
    @JoinColumn({
        name: "reaction_uuid",
        referencedColumnName: "uuid",
    })
    reaction: Reaction | null;

    @Column({ nullable: true })
    @Expose()
    content: string | null;
}