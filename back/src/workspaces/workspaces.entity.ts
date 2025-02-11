import { UUID } from "crypto";
import { User } from "src/users/users.entity";
import { Entity, Column, PrimaryGeneratedColumn, Generated, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm";

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({
        name: "is_public",
        default: false
    })
    isPublic: boolean

    @ManyToOne(() => User, (user) => user.ownedWorkspaces, {})
    @JoinColumn({
        name: "owner_id"
    })
    owner: User
}
