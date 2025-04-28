import { Body, Controller, forwardRef, Inject, Post } from "@nestjs/common";
import { UUID } from "crypto";
import { AuthService } from "./authentication.service";
import { UsersService } from "../users/users.service";
import { ApiSchema } from "@nestjs/swagger";
import { LoginDto } from "./session.entity";

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
    async signin(@Body() dto: LoginDto): Promise<{
        uuid: UUID;
        token: string;
        created_time: Date;
        second_duration: number;
        revoked: boolean;
    }> {
        // Find the user first
        const user = await this.usersService.findOneByEmail(dto.email);

        // Check if user exists
        if (!user) {
            throw new Error(`User with identifier ${dto.email} not found`);
        }

        // Create session for the user
        const session = await this.authService.createSession(user);

        // Return a custom response that includes the token
        return {
            uuid: session.uuid,
            token: session.token, // Include the token in the response
            created_time: session.created_time,
            second_duration: session.second_duration,
            revoked: session.revoked,
        };
    }
}
