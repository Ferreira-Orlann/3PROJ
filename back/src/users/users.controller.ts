import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";
import { AuthActionVerb, AuthZGuard, AuthZService, UsePermissions } from "nest-authz";
import { HttpAuthGuard, IAuthRequest } from "src/authentication/http.authentication.guard";
import { AuthorizationGuard } from "src/authorization/authorization.guard";
import { Authorize, Permission } from "src/authorization/authorization.decorator";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService, private readonly authzService: AuthZService) {}

    @Get()
    @UseGuards(HttpAuthGuard, AuthorizationGuard)
    @Authorize((context) => {
        return {
            domain: "1f790545-d0a6-4bb6-97e7-80adf82913be",
            resource: "21a78b2c-a5de-49a0-bfa5-b1a73eab5013",
            action: "CREATE"
        }
    })
    async get(@Request() req: IAuthRequest) {
        console.log(req.user)
        const en = await this.authzService.enforce(req.user?.uuid, "test", "message", "CREATE")
        console.log("Bool:", en)
        console.log(await this.authzService.getAllSubjects())
        console.log(await this.authzService.getAllRoles())
        console.log(await this.authzService.getAllObjects())
        console.log(await this.authzService.getAllActions())
        console.log(await this.authzService.getUsersForRole("admin", "test"))
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
