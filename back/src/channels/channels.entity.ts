import { UUID } from "crypto";
import { Entity, Column, PrimaryGeneratedColumn, Generated } from "typeorm";

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({default: false})
    isPublic: boolean;

    @Column({default: false})
    workspacesUuid: UUID
}
