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
import { Channel } from "../channels/channels.entity";
import { WorkspaceMember } from "./members/workspace_members.entity";
import { User } from "../users/users.entity";

@Entity({
    name: "workspaces",
})
export class Workspace {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({
        name: "is_public",
        default: false,
    })
    is_public: boolean;

    @OneToMany(() => Channel, (channel) => channel.workspace)
    channels: Promise<Channel[]>;

    @ManyToOne(() => User, (user) => user.ownedWorkspaces, {})
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
    })
    owner: User;

    @OneToMany(() => WorkspaceMember, (member) => member.workspace)
    members: Promise<WorkspaceMember[]>;
}
