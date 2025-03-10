import { ClassSerializerInterceptor, Controller, forwardRef, Get, Inject, Query, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { UUID } from "crypto";
import { AuthService } from "./authentication.service";
import { UsersService } from "../users/users.service";
import { Session } from "./session.entity";


@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    @Get("login")
    @SerializeOptions({
        type: Session
    })
    async signin(@Query("uuid") uuid: UUID): Promise<Session> {
        return await this.authService.createSession(
            await this.usersService.findOneByUuid(uuid),
        );
    }
}
