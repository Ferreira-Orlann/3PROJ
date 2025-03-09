import { Controller, forwardRef, Get, Inject, Query } from "@nestjs/common";
import { UUID } from "crypto";
import { AuthService } from "./authentication.service";
import { UsersService } from "../users/users.service";


@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    @Get("login")
    async signin(@Query("uuid") uuid: UUID) {
        return await this.authService.createSession(
            await this.usersService.findOneByUuid(uuid),
        );
    }
}
