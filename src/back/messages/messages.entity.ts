import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
    Check,
    OneToMany,
} from "typeorm";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";
import { Reaction } from "../reactions/reactions.entity";
import { Exclude, Expose, Transform } from "class-transformer";

@Entity({
    name: "messages",
})
export class Message {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @Column()
    @Expose()
    message: string;

    @Column({ default: false })
    @Expose()
    is_public: boolean;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    @Expose()
    date: Date;

    @Transform(({ value }) => value ? value.uuid : null)
    @Expose()
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({
        name: "source_uuid",
        referencedColumnName: "uuid",
    })
    source: User;


    @Transform(({ value }) => value ? value.uuid : null)
    @ManyToOne(() => User, (user) => user.createdMessage, { nullable: true })
    @Expose()
    @JoinColumn({
        name: "destination_user_uuid",
        referencedColumnName: "uuid",
    })
    destination_user: User | null;


    @Transform(({ value }) => value ? value.uuid : null)
    @ManyToOne(() => Channel, (channel) => channel.createdMessage, {
        nullable: true,
    })
    @Expose()
    @JoinColumn({
        name: "destination_channel_uuid",
        referencedColumnName: "uuid",
    })
    destination_channel: Channel | null;

    @Transform(({ value }) => value ? value : [])
    @Expose()
    @OneToMany(() => Reaction, (reaction) => reaction.message, { eager: true })
    createdReaction: Promise<Reaction[]>;
}
