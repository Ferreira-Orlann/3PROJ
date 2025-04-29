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
import { Expose, Transform } from "class-transformer";

@Entity({
    name: "workspace_members",
})
export class WorkspaceMember {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @Transform(({ value }) => value?.uuid)
    @Expose()
    @ManyToOne(() => User, (user) => user.workspace_members, {
        eager: true,
    })
    @JoinColumn({
        name: "user_uuid",
        referencedColumnName: "uuid",
    })
    user: User;

    @Transform(({ value }) => value?.uuid)
    @Expose()
    @ManyToOne(() => Workspace, (workspace) => workspace.members, {
        eager: true,
    })
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;
}
