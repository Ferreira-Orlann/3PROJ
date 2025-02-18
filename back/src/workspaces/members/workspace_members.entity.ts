import { UUID } from "crypto";
import { User } from "src/users/users.entity";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Workspace } from "../workspaces.entity";

@Entity()
export class WorkspaceMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({
        name: "is_public",
        default: false,
    })
    is_public: boolean;

    @ManyToOne(() => User, (user) => user.workspace_members, {})
    @JoinColumn({
        name: "user_uuid",
    })
    user: User;

    @ManyToOne(() => Workspace)
    @JoinColumn({
        name: "workspace_uuid",
    })
    workspace: Workspace;
}
