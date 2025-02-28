import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "../users";
import { Message } from "../messages";

@Entity()
export class Reaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    emoji: string;

    @ManyToOne(() => User, (user) =>  user.createdReaction, { nullable: false })
    @JoinColumn({
        name: "user_uuid",
        referencedColumnName: "uuid",
    })
    user: User;

    @ManyToOne(() => Message, (message) =>  message.createdReaction, { nullable: false })
    @JoinColumn({
        name: "message_uuid",
        referencedColumnName: "uuid",
    })
    message: Message;

}
