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
    is_public: boolean;

    @ManyToOne(() => User, (user) => user.createdChannels,{nullable: false })
    @JoinColumn({
        name: 'creator_uuid'
    })
    creator: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.channels)
    @JoinColumn({
        name: "workspace_uuid",
    })
    workspace: Workspace;

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];

}
