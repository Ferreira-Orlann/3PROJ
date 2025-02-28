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
import { Workspace } from "../workspaces";
import { User } from "../users";
import { Message } from "../messages";

@Entity({
    name: "channels",
})
export class Channel {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({ default: false })
    isPublic: boolean;

    @ManyToOne(() => User, (user) => user.createdChannels)
    @JoinColumn({
        name: "creator_uuid",
        referencedColumnName: "uuid",
    })
    creator: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.channels, {eager: true})
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;

    @OneToMany(() => Message, (message) => message.destination_channel)
    createdMessage: Promise<Message[]>;
}
