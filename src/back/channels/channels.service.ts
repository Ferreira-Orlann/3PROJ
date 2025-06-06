import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Repository } from "typeorm";
import { CreateChannelDto } from "./channels.dto";
import { Workspace } from "../workspaces/workspaces.entity";
import { randomUUID, UUID } from "crypto";
import { User } from "../users/users.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Events } from "../events.enum";

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelsRepo: Repository<Channel>,

        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepo: Repository<WorkspaceMember>,
        
        private readonly eventEmitter: EventEmitter2,
    ) {}

    findAll(): Promise<Channel[]> {
        return this.channelsRepo.find({
            relations: ["creator", "workspace"],
        });
    }

    findOneByUuid(uuid: UUID): Promise<Channel | null> {
        return this.channelsRepo.findOne({
            where: { uuid },
            relations: ["creator", "workspace"],
        });
    }

    async remove(uuid: UUID): Promise<void> {
        // Récupérer le channel avant de le supprimer pour pouvoir émettre l'événement
        const channel = await this.findOneByUuid(uuid);
        if (channel) {
            await this.channelsRepo.delete(uuid);
            
            // Émettre l'événement de suppression
            this.eventEmitter.emit(Events.CHANNEL_REMOVED, channel);
        }
    }

    async add(dto: CreateChannelDto): Promise<Channel> {
        console.log("Recherche du workspace avec UUID:", dto);
        console.log("Type de UUID:", dto.workspace_uuid);

        // Convertir explicitement en string si nécessaire
        const workspaceUuid = dto.workspace_uuid;
        console.log("UUID après conversion:", workspaceUuid);

        // Essayer de récupérer le workspace avec findOneBy
        const workspace = await this.workspacesRepo.findOneBy({
            uuid: workspaceUuid as any,
        });

        console.log("Résultat de la recherche:", workspace);

        // Vérifier si on a trouvé le workspace
        if (!workspace) {
            // Si on n'a pas trouvé le workspace, essayer de récupérer tous les workspaces pour déboguer
            const allWorkspaces = await this.workspacesRepo.find();
            console.log(
                "Tous les workspaces disponibles:",
                allWorkspaces.map((w) => ({ uuid: w.uuid, name: w.name })),
            );
            throw new Error(`Workspace with UUID ${workspaceUuid} not found`);
        }

        console.log("Workspace trouvé:", workspace);

        const creator = await this.usersRepo.findOneBy({
            uuid: dto.creator_uuid,
        });

        if (!creator) {
            throw new Error("User (creator) not found");
        }

        const isMember = await this.workspaceMembersRepo.findOne({
            where: {
                user: { uuid: dto.creator_uuid },
                workspace: { uuid: dto.workspace_uuid },
            },
        });

        if (!isMember) {
            throw new ForbiddenException(
                "Only workspace members can create channels",
            );
        }
        const date = new Date();
        dto.createdAt = date;

        const newChannel = this.channelsRepo.create({
            ...dto,
            workspace,
            creator,
        });

        const savedChannel = await this.channelsRepo.save(newChannel);
        
        // Émettre l'événement de création
        this.eventEmitter.emit(Events.CHANNEL_CREATED, savedChannel);
        
        return savedChannel;
    }
}
