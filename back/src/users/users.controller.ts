import { Body, Controller, Get, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get()
    get() {
        return this.usersService.findAll()
    }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        return await this.usersService.add(dto)
    }
}