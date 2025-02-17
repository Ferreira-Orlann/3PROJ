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
import { Channel } from "../channels/channels.entity";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    message: string;

    @Column({ default: false })
    isPublic: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @ManyToOne(() => User)
    @JoinColumn({
        name: "user_uuid",
    })
    user: User;

    @ManyToOne(() => Channel)
    @JoinColumn({
        name: "channel_uuid",
    })
    channel: Channel;
}
