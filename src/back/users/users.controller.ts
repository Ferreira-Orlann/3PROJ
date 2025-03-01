import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";
import {
    AuthActionVerb,
    AuthZGuard,
    AuthZService,
    UsePermissions,
} from "nest-authz";
import { HttpAuthGuard, IAuthRequest } from "../authentication/http.authentication.guard";

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authzService: AuthZService,
    ) {}

    @Get()
    @UseGuards(HttpAuthGuard)
    async get(@Request() req: IAuthRequest) {
        console.log(req.user);
        const en = await this.authzService.enforce(
            req.user?.uuid,
            "test",
            "message",
            "CREATE",
        );
        console.log("Bool:", en);
        console.log(await this.authzService.getAllSubjects());
        console.log(await this.authzService.getAllRoles());
        console.log(await this.authzService.getAllObjects());
        console.log(await this.authzService.getAllActions());
        console.log(await this.authzService.getUsersForRole("admin", "test"));
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
