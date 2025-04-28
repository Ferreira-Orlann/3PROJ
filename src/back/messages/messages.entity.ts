import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
    Check, OneToMany,
} from "typeorm";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";
import { Reaction } from "../reactions/reactions.entity";
import { Exclude, Transform } from "class-transformer";

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

    @Transform(({value}) => value?.uuid)
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({
        name: "source_uuid",
        referencedColumnName: "uuid",
    })
    source: User;

    @Transform(({value}) => value?.uuid)
    @ManyToOne(() => User, (user) => user.createdMessage, { nullable: true })
    @JoinColumn({
        name: "destination_user_uuid",
        referencedColumnName: "uuid",
    })
    destination_user: User | null;

    @Transform(({value}) => value?.uuid)
    @ManyToOne(() => Channel, (channel) => channel.createdMessage, {
        nullable: true,
    })
    @JoinColumn({
        name: "destination_channel_uuid",
        referencedColumnName: "uuid",
    })
    destination_channel: Channel | null;

    @OneToMany(() => Reaction, (reaction) => reaction.message, {eager: true})
    createdReaction: Promise<Reaction[]>;
}