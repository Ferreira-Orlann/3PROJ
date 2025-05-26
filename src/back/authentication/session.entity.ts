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
import { Exclude, Expose, Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";
import { OmitType } from "@nestjs/mapped-types";
import { UUIDHolderTransform } from "../uuid";

@Entity({
    name: "sessions",
})
export class Session {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    uuid: UUID;

    @ManyToOne(() => User, (user) => user.sessions, { eager: true })
    @Expose()
    @JoinColumn({
        name: "owner_uuid",
        referencedColumnName: "uuid",
    })
    @Transform(UUIDHolderTransform)
    owner: User;

    @CreateDateColumn()
    @Expose()
    created_time: Date;

    @Column()
    @Expose()
    second_duration: number;

    @Index()
    @Exclude()
    @Column({
        type: "text",
    })
    token: string;

    @Expose()
    @Column({
        default: false,
    })
    revoked: boolean;
}

export class LoginDto {
    @IsEmail()
    email: string;
    @IsNotEmpty()
    password: string;
}

export class ExposedSession extends OmitType(Session, ["token"]) {
    @Expose()
    token: string;
}
