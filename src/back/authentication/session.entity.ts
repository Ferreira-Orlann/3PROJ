import { UUID } from "crypto";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
    RelationId,
} from "typeorm";
import { User } from "../users/users.entity";
import { Exclude, Transform } from "class-transformer";

@Entity({
    name: "sessions",
})
export class Session {
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @ManyToOne(() => User, (user) => user.sessions, { eager: true })
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
    })
    @Transform(({value}: {value: User}) => value.uuid)
    owner: User;

    @CreateDateColumn()
    created_time: Date;

    @Column()
    second_duration: number;
    @Exclude()
    @Index()
    @Column({
        type: "text",
    })
    token: string;

    @Column({
        default: false,
    })
    revoked: boolean;
}
