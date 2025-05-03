import {
    Body,
    Controller,
    forwardRef,
    Inject,
    Post,
    Res,
} from "@nestjs/common";
import { AuthService } from "./authentication.service";
import { UsersService } from "../users/users.service";
import { ApiSchema } from "@nestjs/swagger";
import { LoginDto, Session } from "./session.entity";

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
    async signin(@Body() dto: LoginDto, @Res() res): Promise<Session> {
        try {
            console.log("Login attempt with:", dto);

            // Find the user first
            const user = await this.usersService.findOneByEmail(dto.email);

            // Check if user exists
            if (!user) {
                console.log("User not found");
                throw new Error(`User with identifier ${dto.email} not found`);
            }

            // Create session for the user
            const session = await this.authService.createSession(user);
            return session;
        } catch (error) {
            console.error("Error in signin:", error);
            throw error;
        }
    }
}
