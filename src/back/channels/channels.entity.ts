import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "../users/users.entity";
import { Message } from "../messages/messages.entity";
import { Exclude, Expose, Transform } from "class-transformer";
import { Notification } from "../notifications/notification.entity";

@Entity({
    name: "channels",
})
export class Channel {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @Column()
    @Expose()
    name: string;

    @Column({ nullable: true })
    @Expose()
    description: string;

    @Column({ default: false })
    @Expose()
    is_public: boolean;

    @Column({ nullable: true })
    @Expose()
    createdAt: Date;

    @Transform(({ value }) => (value ? value.uuid : null))
    @Expose()
    @ManyToOne(() => User, (user) => user.createdChannels)
    @JoinColumn({
        name: "creator_uuid",
        referencedColumnName: "uuid",
    })
    creator: User;

    @Transform(({ value }) => (value ? value.uuid : null))
    @Expose()
    @ManyToOne(() => Workspace, (workspace) => workspace.channels, {
        eager: true,
    })
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;

    @Exclude()
    @OneToMany(() => Message, (message) => message.destination_channel)
    createdMessage: Promise<Message[]>;

    @Transform(({ value }) => null)
    @OneToMany(() => Notification, (notification) => notification.channel)
    notifications: Promise<Notification[]>;
}
