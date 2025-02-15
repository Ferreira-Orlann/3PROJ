import { UUID } from "crypto";
import { Entity, Column, PrimaryGeneratedColumn, Generated, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/users.entity";

@Entity()
export class Messaging {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    message: string;

    @Column({default: false})
    isPublic: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @ManyToOne(() => User, (user) => user.messaging, {})
    @JoinColumn({
        name: "user_uuid",
    })
    user: User;
}
