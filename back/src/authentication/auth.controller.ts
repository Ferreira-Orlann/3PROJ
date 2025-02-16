import { Controller, Get, Query } from "@nestjs/common";
import { UUID } from "crypto";
import { AuthService } from "./auth.service";
import { UsersService } from "src/users/users.service";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private usersService: UsersService,
    ) {}

    @Get("signin")
    async signin(@Query("uuid") uuid: UUID) {
        return await this.authService.createSession(
            await this.usersService.findOneByUuid(uuid),
        );
    }
}
