import { UUID } from "crypto";
import { User } from "src/users/users.entity";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Channel } from "../channels/channels.entity";

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({
        name: "is_public",
        default: false,
    })
    isPublic: boolean;

    @OneToMany(() => Channel, (channel) => channel.workspace)
    channels: Channel[];

    @ManyToOne(() => User, (user) => user.ownedWorkspaces, {})
    @JoinColumn({
        name: "owner_uuid",
    })
    owner: User;
}
