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

    @ManyToOne(() => User)
    @JoinColumn({
        name: "owner_uuid",
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

    validateToken(): boolean {
        return false;
    }
}
