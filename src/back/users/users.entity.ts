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
import { Exclude } from "class-transformer";
import { ApiHideProperty, ApiProperty, ApiPropertyOptional, ApiSchema } from "@nestjs/swagger";

@Entity({
    name: "users",
})
@ApiSchema({
    description: "Represent and User"
})
export class User {
    @ApiProperty({
        examples: ["4f8dc026-a1f2-4cd5-a394-ec8c403569c5"]
    })
    @PrimaryGeneratedColumn("uuid")
    uuid: UUID;

    @ApiProperty()
    @Column()
    username: string;

    @ApiPropertyOptional()
    @Column()
    firstname: string;

    @ApiPropertyOptional()
    @Column()
    lastname: string;

    @ApiPropertyOptional()
    @Column()
    email: string;

    @ApiPropertyOptional()
    @Column()
    address: string;

    @ApiProperty()
    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.OFFLINE,
    })
    status: UserStatus;

    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Promise<Workspace[]>;

    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => WorkspaceMember, (member) => member.user)
    workspace_members: Promise<WorkspaceMember[]>;
    
    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => Channel, (channel) => channel.creator)
    createdChannels: Promise<Channel[]>;
    
    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => Session, (session) => session.owner)
    sessions: Promise<Session[]>;
    
    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => Message, (message) => message.source)
        createdMessage: Promise<Message[]>;
    
    @ApiHideProperty()
    @Exclude()
    @OneToMany(() => Reaction, (reaction) => reaction.user)
    createdReaction: Promise<Reaction[]>;
}
