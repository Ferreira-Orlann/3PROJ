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

    //kenan google
   async addGoogleUser(userData: Partial<User>): Promise<User> {
    if (!userData.address) {
        userData.address = ''; // valeur par défaut non nulle
  }
    const user = this.usersRepo.create(userData); // crée une entité User à partir des données partielles
    return await this.usersRepo.save(user); // persiste en base
}


}
