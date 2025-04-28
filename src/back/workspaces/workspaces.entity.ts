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
import { Expose } from "class-transformer";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { OmitType } from "@nestjs/mapped-types";

@Entity({
    name: "workspaces",
})
@ApiSchema({
    description: "Represent and Workspace",
    name: "ExposedWorkspace",
})
export class Workspace {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    @ApiProperty()
    uuid: UUID;

    @Column()
    @Expose()
    @ApiProperty()
    name: string;

    @Column({ nullable: true })
    @Expose()
    @ApiProperty()
    description: string;

    @Column({
        name: "is_public",
        default: false,
    })
    @Expose()
    @ApiProperty()
    is_public: boolean;

    @Column({ nullable: true })
    @Expose()
    @ApiProperty()
    createdAt: Date;

    @Transform(({ value }) => null)
    @OneToMany(() => Channel, (channel) => channel.workspace)
    channels: Promise<Channel[]>;

    @Column({ name: "owner_uuid", nullable: true })
    @Expose()
    @ApiProperty()
    owner_uuid: UUID;

    @Transform(({ value }) => value?.uuid)
    @ManyToOne(() => User, (user) => user.ownedWorkspaces, {})
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
    })
    owner: User;

    @Transform(({ value }) => null)
    @OneToMany(() => WorkspaceMember, (member) => member.workspace)
    members: Promise<WorkspaceMember[]>;
}