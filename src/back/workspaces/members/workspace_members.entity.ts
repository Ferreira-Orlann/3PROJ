import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    JoinColumn,
    ManyToOne,
} from "typeorm";
import { Workspace } from "../workspaces.entity";
import { User } from "../../users/users.entity";

@Entity({
    name: "workspace_members",
})
export class WorkspaceMember {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @ManyToOne(() => User, (user) => user.workspace_members, {
        eager: true,
    })
    @JoinColumn({
        name: "user_uuid",
        referencedColumnName: "uuid",
    })
    user: User;

    @ManyToOne(() => Workspace, (workspace) => workspace.members, {
        eager: true,
    })
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;
}
