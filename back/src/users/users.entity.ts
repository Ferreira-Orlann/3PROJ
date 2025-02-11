import { Entity, ManyToOne, OneToMany } from "typeorm";
import { UUID } from "crypto";
import { Column, Generated, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./users.status.enum";
import { Workspace } from "src/workspaces/workspaces.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    username: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    address: string;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.OFFLINE,
    })
    status: UserStatus;

    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Workspace[];
}
