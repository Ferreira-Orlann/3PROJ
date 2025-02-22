import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../users/users.entity";
import { Message } from "../messages/messages.entity";

@Entity()
export class Reaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    emoji: string;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "user_uuid" })
    user: User;

    @ManyToOne(() => Message, { nullable: false })
    @JoinColumn({ name: "message_uuid" })
    message: Message;
}
