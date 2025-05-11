import { Injectable } from "@nestjs/common";
import { UUID } from "crypto";
import { CreateRoleDto, Role } from "./role.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthorizationService {
    constructor(
        @InjectRepository(Role)
        private readonly rolesRepo: Repository<Role>,
    ) {}

    findAllRoles(): Promise<Role[]> {
        return this.rolesRepo.find();
    }

    findPagingRoles(page: number, pageSize: number, workspaceUUID: UUID): Promise<Role[]> {
        return this.rolesRepo.find({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: {
                workspace: {
                    uuid: workspaceUUID
                }
            }
        });
    }

    findOneRoleByUuidAndWorkspace(uuid: UUID, workspaceUUID: UUID): Promise<Role | null> {
        return this.rolesRepo.findOne({
            where: { 
                uuid, 
                workspace: {
                    uuid: workspaceUUID
                }
            }
        });
    }

    async removeRole(uuid: UUID): Promise<void> {
        this.rolesRepo.delete(uuid);
    }

    async addRole(dto: CreateRoleDto): Promise<Role> {
        return this.rolesRepo.save(dto);
    }

    async updateRole(uuid: UUID, dto): Promise<Role> {
        return this.rolesRepo.save({ ...dto, uuid });
    }
}