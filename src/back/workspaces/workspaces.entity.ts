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
import { Transform } from "class-transformer";

@Entity({
    name: "workspaces",
})
export class Workspace {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        name: "is_public",
        default: false,
    })
    is_public: boolean;

    @Column({ nullable: true })
    createdAt: Date;

    @Transform(({value}) => null)
    @OneToMany(() => Channel, (channel) => channel.workspace)
    channels: Promise<Channel[]>;

    @Column({ name: "owner_uuid", nullable: true })
    owner_uuid: UUID;
    
    @Transform(({value}) => value?.uuid)
    @ManyToOne(() => User, (user) => user.ownedWorkspaces, {})
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
    })
    owner: User;

    @Transform(({value}) => null)
    @OneToMany(() => WorkspaceMember, (member) => member.workspace)
    members: Promise<WorkspaceMember[]>;
}