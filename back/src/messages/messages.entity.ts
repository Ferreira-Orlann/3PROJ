import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
    Check,
} from "typeorm";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";

@Entity({
    name: "messages",
})
export class Message {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @Column()
    message: string;

    @Column({ default: false })
    is_public: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    date: Date;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({
        name: "source_uuid",
        referencedColumnName: "uuid",
    })
    source: User;

    @ManyToOne(() => User, (user) => user.createdMessage, { nullable: true })
    @JoinColumn({
        name: "destination_user_uuid",
        referencedColumnName: "uuid",
    })
    destination_user: User | null;

    @ManyToOne(() => Channel, (channel) => channel.createdMessage, {
        nullable: true,
    })
    @JoinColumn({
        name: "destination_channel_uuid",
        referencedColumnName: "uuid",
    })
    destination_channel: Channel | null;
}
