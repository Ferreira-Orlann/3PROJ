import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
    RelationId,
} from "typeorm";
import { User } from "../users/users.entity";

@Entity({
    name: "sessions",
})
export class Session {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @ManyToOne(() => User, (user) => user.sessions, { eager: true })
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
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
