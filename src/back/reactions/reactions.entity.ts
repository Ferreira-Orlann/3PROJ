import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";
import { User } from "../users/users.entity";
import { Message } from "../messages/messages.entity";
import { Notification } from "../notifications/notification.entity";

@Entity()
export class Reaction {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    emoji: string;

    @ManyToOne(() => User, (user) => user.createdReaction, { nullable: false })
    @JoinColumn({
        name: "user_uuid",
        referencedColumnName: "uuid",
    })
    user: User;

    @ManyToOne(() => Message, (message) => message.createdReaction, {
        nullable: false,
    })
    @JoinColumn({
        name: "message_uuid",
        referencedColumnName: "uuid",
    })
    message: Message;

    @OneToMany(() => Notification, (notification) => notification.reaction)
    notifications: Promise<Notification[]>;
}
