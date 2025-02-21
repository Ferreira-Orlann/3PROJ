import { UUID } from "crypto";
import { Entity, Column, PrimaryGeneratedColumn, Generated, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "../users/users.entity";
import { Message } from "../messages/messages.entity";

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({ default: false })
    isPublic: boolean;

    @ManyToOne(() => User, (user) => user.createdChannels)
    @JoinColumn({
        name: "creator_uuid",
        referencedColumnName: "uuid"
    })
    creator: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.channels)
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid"
    })
    workspace: Workspace;

    @OneToMany(() => Message, (message) => message.destination_channel)
    createdMessage: Promise<Message[]>;

}
