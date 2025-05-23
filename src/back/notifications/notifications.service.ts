import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UUID } from "crypto";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Notification, NotificationType } from "./notification.entity";
import { CreateNotificationDto, UpdateNotificationDto } from "./notifications.dto";
import { UsersService } from "../users/users.service";
import { ChannelsService } from "../channels/channels.service";
import { WorkspacesService } from "../workspaces/workspaces.service";
import { MessagesService } from "../messages/messages.service";
import { ReactionsService } from "../reactions/reactions.service";
import { Events } from "../events.enum";
import { Message } from "../messages/messages.entity";
import { Reaction } from "../reactions/reactions.entity";
import { User } from "../users/users.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";
import { Workspace } from "../workspaces/workspaces.entity";
import { Channel } from "../channels/channels.entity";

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepo: Repository<Notification>,

        private readonly usersService: UsersService,
        private readonly channelsService: ChannelsService,
        private readonly workspacesService: WorkspacesService,
        private readonly messagesService: MessagesService,
        private readonly reactionsService: ReactionsService,

        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findAll(): Promise<Notification[]> {
        return this.notificationRepo.find({
            relations: ["recipient", "sender", "message", "channel", "workspace", "reaction"],
            order: { created_at: "DESC" },
        });
    }

    async findByRecipient(recipientUuid: UUID): Promise<Notification[]> {
        const notification = await this.notificationRepo.find({
            where: {
                recipient: { uuid: recipientUuid },
            },
            relations: ["recipient", "sender", "message", "channel", "workspace", "reaction"],
            order: { created_at: "DESC" },
        });
        console.log("notification", notification);
        if (!notification) {
            throw new NotFoundException(`Notification with recipient UUID ${recipientUuid} not found`);
        }
        return notification;
    }

    async findUnreadByRecipient(recipientUuid: UUID): Promise<Notification[]> {
        const notification = await this.notificationRepo.find({
            where: {
                recipient: { uuid: recipientUuid },
                read: false,
            },
            relations: ["recipient", "sender", "message", "channel", "workspace", "reaction"],
            order: { created_at: "DESC" },
        });

        if (!notification) {
            throw new NotFoundException(`Notification with recipient UUID ${recipientUuid} not found`);
        }
        return notification;
    }

    async findOneByUuid(uuid: UUID): Promise<Notification | null> {
        return this.notificationRepo.findOne({
            where: { uuid },
            relations: ["recipient", "sender", "message", "channel", "workspace", "reaction"],
        });
    }

    async create(dto: CreateNotificationDto): Promise<Notification> {
        const recipient = await this.usersService.findOneByUuid(dto.recipient_uuid);
        if (!recipient) {
            throw new NotFoundException(`Recipient user with UUID ${dto.recipient_uuid} not found`);
        }

        const created_at = new Date();
        const notification = this.notificationRepo.create({
            type: dto.type,
            recipient,
            created_at,
        });

        if (dto.sender_uuid) {
            const sender = await this.usersService.findOneByUuid(dto.sender_uuid);
            if (sender) {
                notification.sender = sender;
            }
        }

        if (dto.message_uuid) {
            const message = await this.messagesService.findOneBy(dto.message_uuid);
            if (message) {
                notification.message = message;
            }
        }

        if (dto.channel_uuid) {
            const channel = await this.channelsService.findOneByUuid(dto.channel_uuid);
            if (channel) {
                notification.channel = channel;
            }
        }

        if (dto.workspace_uuid) {
            const workspace = await this.workspacesService.findOne(dto.workspace_uuid);
            if (workspace) {
                notification.workspace = workspace;
            }
        }

        if (dto.reaction_uuid) {
            const reaction = await this.reactionsService.findOneBy(dto.reaction_uuid);
            if (reaction) {
                notification.reaction = reaction;
            }
        }

        if (dto.content) {
            notification.content = dto.content;
        }

        const savedNotification = await this.notificationRepo.save(notification);
        
        // Émettre un événement pour que les websockets puissent notifier en temps réel
        this.eventEmitter.emit(Events.NOTIFICATION_CREATED, savedNotification);
        
        return savedNotification;
    }

    async markAsRead(uuid: UUID): Promise<Notification> {
        const notification = await this.findOneByUuid(uuid);
        if (!notification) {
            throw new NotFoundException(`Notification with UUID ${uuid} not found`);
        }

        notification.read = true;
        const updatedNotification = await this.notificationRepo.save(notification);
        
        // Émettre un événement pour que les websockets puissent mettre à jour en temps réel
        this.eventEmitter.emit(Events.NOTIFICATION_READ, updatedNotification);
        
        return updatedNotification;
    }

    async markAllAsRead(recipientUuid: UUID): Promise<void> {
        await this.notificationRepo.update(
            { recipient: { uuid: recipientUuid }, read: false },
            { read: true }
        );
    }

    async update(uuid: UUID, dto: UpdateNotificationDto): Promise<Notification> {
        const notification = await this.findOneByUuid(uuid);
        if (!notification) {
            throw new NotFoundException(`Notification with UUID ${uuid} not found`);
        }

        Object.assign(notification, dto);
        return this.notificationRepo.save(notification);
    }

    async remove(uuid: UUID): Promise<void> {
        const notification = await this.findOneByUuid(uuid);
        if (!notification) {
            throw new NotFoundException(`Notification with UUID ${uuid} not found`);
        }

        await this.notificationRepo.delete(uuid);
    }

    // Event listeners for creating notifications
    @OnEvent(Events.MESSAGE_CREATED)
    async handleMessageCreated(message: Message): Promise<void> {
        if (message.destination_user) {
            // Create notification for private message
            await this.create({
                type: NotificationType.MESSAGE_RECEIVED,
                recipient_uuid: message.destination_user.uuid,
                sender_uuid: message.source.uuid,
                message_uuid: message.uuid,
                content: `${message.source.username} vous a envoyé un message`,
            });
        } else if (message.destination_channel) {
            // Pour les messages dans un channel, notifier tous les membres du channel
            // sauf l'expéditeur
            const channel = message.destination_channel;
            const workspace = await channel.workspace;
            const members = await workspace.members;
            
            for (const member of members) {
                const user = await member.user;
                // Ne pas notifier l'expéditeur
                if (user.uuid !== message.source.uuid) {
                    await this.create({
                        type: NotificationType.MESSAGE_RECEIVED,
                        recipient_uuid: user.uuid,
                        sender_uuid: message.source.uuid,
                        message_uuid: message.uuid,
                        channel_uuid: channel.uuid,
                        workspace_uuid: workspace.uuid,
                        content: `${message.source.username} a envoyé un message dans #${channel.name}`,
                    });
                }
            }
        }
    }

    @OnEvent(Events.REACTION_CREATED)
    async handleReactionCreated(reaction: Reaction): Promise<void> {
        const message = await reaction.message;
        const source = await reaction.user;
        
        if (message) {
            // Get the message owner
            const messageSource = await message.source;
            
            // Don't notify if the person reacting is the message owner
            if (messageSource.uuid !== source.uuid) {
                await this.create({
                    type: NotificationType.REACTION_RECEIVED,
                    recipient_uuid: messageSource.uuid,
                    sender_uuid: source.uuid,
                    message_uuid: message.uuid,
                    reaction_uuid: reaction.uuid,
                    content: `${source.username} a réagi à votre message avec ${reaction.emoji}`,
                });
            }
        }
    }
    
    @OnEvent(Events.WORKSPACE_MEMBER_ADDED)
    async handleWorkspaceMemberAdded(data: { member: WorkspaceMember, addedBy: User }): Promise<void> {
        const member = data.member;
        const workspace = await member.workspace;
        const user = await member.user;
        
        // Notifier l'utilisateur qu'il a été ajouté à un workspace
        await this.create({
            type: NotificationType.WORKSPACE_ADDED,
            recipient_uuid: user.uuid,
            sender_uuid: data.addedBy.uuid,
            workspace_uuid: workspace.uuid,
            content: `Vous avez été ajouté au workspace ${workspace.name} par ${data.addedBy.username}`,
        });
        
        // Notifier les autres membres du workspace qu'un nouveau membre a été ajouté
        const members = await workspace.members;
        for (const existingMember of members) {
            const existingUser = await existingMember.user;
            // Ne pas notifier le nouveau membre ni celui qui l'a ajouté
            if (existingUser.uuid !== user.uuid && existingUser.uuid !== data.addedBy.uuid) {
                await this.create({
                    type: NotificationType.WORKSPACE_ADDED,
                    recipient_uuid: existingUser.uuid,
                    sender_uuid: data.addedBy.uuid,
                    workspace_uuid: workspace.uuid,
                    content: `${user.username} a été ajouté au workspace ${workspace.name} par ${data.addedBy.username}`,
                });
            }
        }
    }
    
    @OnEvent(Events.WORKSPACE_MEMBER_REMOVED)
    async handleWorkspaceMemberRemoved(data: { member: WorkspaceMember, removedBy: User }): Promise<void> {
        const member = data.member;
        const workspace = await member.workspace;
        const user = await member.user;
        
        // Notifier l'utilisateur qu'il a été retiré d'un workspace
        await this.create({
            type: NotificationType.WORKSPACE_ADDED,
            recipient_uuid: user.uuid,
            sender_uuid: data.removedBy.uuid,
            workspace_uuid: workspace.uuid,
            content: `Vous avez été retiré du workspace ${workspace.name} par ${data.removedBy.username}`,
        });
        
        // Notifier les autres membres du workspace qu'un membre a été retiré
        const members = await workspace.members;
        for (const existingMember of members) {
            const existingUser = await existingMember.user;
            // Ne pas notifier le membre retiré ni celui qui l'a retiré
            if (existingUser.uuid !== user.uuid && existingUser.uuid !== data.removedBy.uuid) {
                await this.create({
                    type: NotificationType.WORKSPACE_ADDED,
                    recipient_uuid: existingUser.uuid,
                    sender_uuid: data.removedBy.uuid,
                    workspace_uuid: workspace.uuid,
                    content: `${user.username} a été retiré du workspace ${workspace.name} par ${data.removedBy.username}`,
                });
            }
        }
    }
    
    @OnEvent(Events.WORKSPACE_CREATED)
    async handleWorkspaceCreated(workspace: Workspace): Promise<void> {
        // Récupérer le propriétaire du workspace
        const owner = await workspace.owner;
        
        // Notifier le propriétaire que son workspace a été créé
        await this.create({
            type: NotificationType.WORKSPACE_ADDED,
            recipient_uuid: owner.uuid,
            workspace_uuid: workspace.uuid,
            content: `Votre workspace ${workspace.name} a été créé avec succès`,
        });
    }
    
    @OnEvent(Events.WORKSPACE_UPDATED)
    async handleWorkspaceUpdated(workspace: Workspace): Promise<void> {
        // Notifier tous les membres du workspace qu'il a été mis à jour
        const members = await workspace.members;
        for (const member of members) {
            const user = await member.user;
            await this.create({
                type: NotificationType.WORKSPACE_ADDED,
                recipient_uuid: user.uuid,
                workspace_uuid: workspace.uuid,
                content: `Le workspace ${workspace.name} a été mis à jour`,
            });
        }
    }
    
    @OnEvent(Events.WORKSPACE_REMOVED)
    async handleWorkspaceRemoved(workspace: Workspace): Promise<void> {
        // Récupérer tous les membres avant la suppression
        const members = await workspace.members;
        const owner = await workspace.owner;
        
        // Notifier tous les membres que le workspace a été supprimé
        for (const member of members) {
            const user = await member.user;
            // Ne pas notifier le propriétaire qui a supprimé le workspace
            if (user.uuid !== owner.uuid) {
                await this.create({
                    type: NotificationType.WORKSPACE_ADDED,
                    recipient_uuid: user.uuid,
                    sender_uuid: owner.uuid,
                    content: `Le workspace ${workspace.name} a été supprimé par ${owner.username}`,
                });
            }
        }
    }
    
    @OnEvent(Events.CHANNEL_CREATED)
    async handleChannelCreated(channel: Channel): Promise<void> {
        // Récupérer le workspace et ses membres
        const workspace = await channel.workspace;
        const members = await workspace.members;
        const creator = await channel.creator;
        
        // Notifier tous les membres du workspace qu'un nouveau channel a été créé
        for (const member of members) {
            const user = await member.user;
            // Ne pas notifier le créateur du channel
            if (user.uuid !== creator.uuid) {
                await this.create({
                    type: NotificationType.CHANNEL_REACTION,
                    recipient_uuid: user.uuid,
                    sender_uuid: creator.uuid,
                    channel_uuid: channel.uuid,
                    workspace_uuid: workspace.uuid,
                    content: `${creator.username} a créé le channel #${channel.name} dans ${workspace.name}`,
                });
            }
        }
    }
    
    @OnEvent(Events.CHANNEL_REMOVED)
    async handleChannelRemoved(channel: Channel): Promise<void> {
        // Récupérer le workspace et ses membres
        const workspace = await channel.workspace;
        const members = await workspace.members;
        const creator = await channel.creator;
        
        // Notifier tous les membres du workspace qu'un channel a été supprimé
        for (const member of members) {
            const user = await member.user;
            await this.create({
                type: NotificationType.CHANNEL_REACTION,
                recipient_uuid: user.uuid,
                sender_uuid: creator.uuid,
                workspace_uuid: workspace.uuid,
                content: `Le channel #${channel.name} a été supprimé dans ${workspace.name}`,
            });
        }
    }
    
    // Méthode pour créer une notification de réaction dans un channel
    async createChannelReactionNotification(channelUuid: UUID, userUuid: UUID, emoji: string): Promise<void> {
        const channel = await this.channelsService.findOneByUuid(channelUuid);
        const user = await this.usersService.findOneByUuid(userUuid);
        
        if (!channel || !user) {
            return;
        }
        
        const workspace = await channel.workspace;
        const members = await workspace.members;
        
        // Notifier tous les membres du workspace sauf l'utilisateur qui a réagi
        for (const member of members) {
            const memberUser = await member.user;
            if (memberUser.uuid !== userUuid) {
                await this.create({
                    type: NotificationType.CHANNEL_REACTION,
                    recipient_uuid: memberUser.uuid,
                    sender_uuid: userUuid,
                    channel_uuid: channelUuid,
                    workspace_uuid: workspace.uuid,
                    content: `${user.username} a réagi avec ${emoji} dans le channel #${channel.name}`,
                });
            }
        }
    }
}
