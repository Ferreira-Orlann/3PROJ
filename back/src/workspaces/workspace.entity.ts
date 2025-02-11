import { UUID } from "crypto";
import { Entity, Column, PrimaryGeneratedColumn, Generated } from "typeorm";

@Entity()
export class Workspace {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated("uuid")
    uuid: UUID;

    @Column()
    name: string;

    @Column({default: false})
    isPublic: boolean
}
