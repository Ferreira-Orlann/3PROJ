import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "../users/users.entity";

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

    @ManyToOne(() => User, (user) => user.createdChannels, { nullable: false })
    @JoinColumn({
        name: "creator_id",
    })
    creator: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.channels)
    @JoinColumn({
        name: "workspace_uuid",
    })
    workspace: Workspace;
}
