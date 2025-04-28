import { Entity, OneToMany } from "typeorm";
import { UUID } from "crypto";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./users.status.enum";
import { Workspace } from "../workspaces/workspaces.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";
import { Channel } from "../channels/channels.entity";
import { Session } from "../authentication/session.entity";
import { Message } from "../messages/messages.entity";
import { Reaction } from "../reactions/reactions.entity";
import { Expose } from "class-transformer";
import { ApiProperty, ApiSchema, OmitType } from "@nestjs/swagger";

@Entity({
    name: "users",
})
@ApiSchema({
    description: "Represent and User",
    name: "ExposedUser"
})
export class User {
    @PrimaryGeneratedColumn("uuid")
    @Expose()
    @ApiProperty({
        examples: ["4f8dc026-a1f2-4cd5-a394-ec8c403569c5"]
    })
    uuid: UUID;

    @Column()
    @Expose()
    @ApiProperty()
    username: string;
    
    @Column({
        default: UserStatus.OFFLINE,
        enum: UserStatus
    })
    @Expose()
    @ApiProperty()
    status: UserStatus;

    @Column()
    @Expose()
    @ApiProperty()
    firstname: string;

    @Column()
    @Expose()
    @ApiProperty()
    lastname: string;

    @Column()
    @Expose()
    @ApiProperty()
    email: string;

    @Column({ nullable: true })
    @Expose()
    @ApiProperty({ required: false })
    mdp: string;

    @Column()
    @Expose()
    @ApiProperty()
    address: string;

    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Promise<Workspace[]>;

    @OneToMany(() => WorkspaceMember, (member) => member.user)
    workspace_members: Promise<WorkspaceMember[]>;
    
    @OneToMany(() => Channel, (channel) => channel.creator)
    createdChannels: Promise<Channel[]>;
    
    @OneToMany(() => Session, (session) => session.owner)
    sessions: Promise<Session[]>;
    
    @OneToMany(() => Message, (message) => message.source)
        createdMessage: Promise<Message[]>;
    
    @OneToMany(() => Reaction, (reaction) => reaction.user)
    createdReaction: Promise<Reaction[]>;
}

@ApiSchema({
    name: "User"
})
export class BasicUser extends OmitType(User, ["email", "firstname", "lastname", "address"]) {}