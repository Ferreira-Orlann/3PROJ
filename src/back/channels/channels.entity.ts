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
import { Exclude, Transform } from "class-transformer";

@Entity({
    name: "channels",
})
export class Channel {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: false })
    is_public: boolean;

    @Column({ nullable: true })
    createdAt: Date;

    @Transform(({value}) => value.uuid)
    @ManyToOne(() => User, (user) => user.createdChannels)
    @JoinColumn({
        name: "creator_uuid",
        referencedColumnName: "uuid",
    })
    creator: User;

    @Transform(({value}) => value.uuid)
    @ManyToOne(() => Workspace, (workspace) => workspace.channels, {eager: true})
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;

    @Exclude()
    @OneToMany(() => Message, (message) => message.destination_channel)
    createdMessage: Promise<Message[]>;
}
