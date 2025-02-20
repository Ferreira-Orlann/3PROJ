import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    get() {
        return this.usersService.findAll();
    }

    @Get(":id")
    getById(@Param("id") id: UUID) {
        return this.usersService.findOneByUuid(id);
    }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        return await this.usersService.add(dto);
    }
}
