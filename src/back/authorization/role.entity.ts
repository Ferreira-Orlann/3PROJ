import { Expose, Transform } from "class-transformer";
import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Workspace } from "../workspaces/workspaces.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";
import { OmitType, PickType } from "@nestjs/mapped-types";
import { ApiSchema } from "@nestjs/swagger";

@Entity({
    name: "roles",
})
export class Role {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @Column()
    name: String

    @ManyToOne(() => Workspace, (workspace) => workspace.roles, {
        eager: true,
    })
    @Expose()
    @Transform(({value}: {value: Workspace}) => value.uuid)
    @JoinColumn({
        name: "workspace_uuid",
        referencedColumnName: "uuid",
    })
    workspace: Workspace;

    @ManyToMany(() => WorkspaceMember, member => member.roles)
    @Expose()
    members: Promise<WorkspaceMember[]>;
}

@ApiSchema()
export class CreateRoleDto extends PickType(Role, ["name"]) {}

