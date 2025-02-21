import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./users.dto";
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

    findOneByUuid(uuid: UUID): Promise<User | null> {
        return this.usersRepo.findOneBy({ uuid });
    }

    async remove(uuid: UUID): Promise<void> {
        this.usersRepo.delete(uuid);
    }

    async add(dto: CreateUserDto): Promise<User> {
        return this.usersRepo.save(dto);
    }
}
