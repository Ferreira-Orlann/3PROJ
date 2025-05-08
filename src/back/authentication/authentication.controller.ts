import {
    Body,
    Controller,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Post,
    Res,
    SerializeOptions,
} from "@nestjs/common";
import { AuthService } from "./authentication.service";
import { UsersService } from "../users/users.service";
import { ApiSchema } from "@nestjs/swagger";
import { ExposedSession, LoginDto, Session } from "./session.entity";

@ApiSchema({
    description: "Authentification",
})
@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    @Post("login")
    @SerializeOptions({
        type: ExposedSession
    })
    async signin(@Body() dto: LoginDto): Promise<Session> {
        console.log("Login attempt with:", dto);

        // Find the user first
        const user = await this.usersService.findOneByEmail(dto.email);

        // Check if user exists
        if (!user) {
            console.log("User not found");
            throw new HttpException(`User with identifier ${dto.email} not found`, HttpStatus.NOT_FOUND);
        }

        // Create session for the user
        const session = await this.authService.createSession(user);
        console.log("Controller Session:", session)
        return session;
    }
}
