import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto, User } from "./users.entity";
import { Repository } from "typeorm";
import { UUID } from "crypto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    findAll(): Promise<User[]> {
        return this.usersRepo.find();
    }

    findPaging(page: number, pageSize: number): Promise<User[]> {
        return this.usersRepo.find({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }

    findOneByUuid(uuid: UUID): Promise<User | null> {
        return this.usersRepo.findOne({
            where: { uuid },
            relations: ["workspace_members", "workspace_members.workspace"],
        });
    }

    findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepo.findOne({
            where: { email },
            relations: ["workspace_members", "workspace_members.workspace"],
        });
    }

    async remove(uuid: UUID): Promise<void> {
        this.usersRepo.delete(uuid);
    }

    async add(dto: CreateUserDto): Promise<User> {
        return this.usersRepo.save(dto);
    }

    async update(uuid: UUID, dto: CreateUserDto): Promise<User> {
        return this.usersRepo.save({ ...dto, uuid });
    }
}
