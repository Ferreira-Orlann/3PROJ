import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "./users.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    findAll(): Promise<User[]> {
        return this.usersRepo.find();
    }

    findOne(id: number): Promise<User | null> {
        return this.usersRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.usersRepo.delete(id);
    }

    async add(dto: CreateUserDto): Promise<User> {
        return this.usersRepo.save(dto);
    }
}
