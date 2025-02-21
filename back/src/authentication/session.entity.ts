import { UUID } from "crypto";
import { User } from "src/users/users.entity";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from "typeorm";

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @ManyToOne(() => User, (user) => user.sessions, {eager: true})
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid"
    })
    owner: User;

    @CreateDateColumn()
    created_time: Date;

    @Column()
    second_duration: number;

    @Index()
    @Column({
        type: "text",
    })
    token: string;

    @Column({
        default: false,
    })
    revoked: boolean;
}
