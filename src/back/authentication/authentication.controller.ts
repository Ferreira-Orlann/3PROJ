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
    async signin(@Query("uuid") uuid: UUID): Promise<{ uuid: UUID; token: string; created_time: Date; second_duration: number; revoked: boolean }> {
        // Find the user first
        const user = await this.usersService.findOneByUuid(uuid);
        
        // Check if user exists
        if (!user) {
            throw new Error(`User with UUID ${uuid} not found`);
        }
        
        // Create session for the user
        const session = await this.authService.createSession(user);
        
        // Return a custom response that includes the token
        return {
            uuid: session.uuid,
            token: session.token, // Include the token in the response
            created_time: session.created_time,
            second_duration: session.second_duration,
            revoked: session.revoked
        };
    }
}
