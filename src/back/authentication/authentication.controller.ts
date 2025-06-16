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
import { OAuth2Client } from "google-auth-library"; // google kenan
import * as process from "process"; // google kenan
import { UnauthorizedException } from "@nestjs/common";


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
        type: ExposedSession,
    })
    async signin(@Body() dto: LoginDto): Promise<Session> {
        console.log("Login attempt with:", dto);

        const user = await this.usersService.findOneByEmail(dto.email);

        if (!user) {
            console.log("User not found");
            throw new HttpException(
                `User with identifier ${dto.email} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        const session = await this.authService.createSession(user);
        console.log("Controller Session:", session);
        return session;
    }

    // google kenan
@Post("google")
async googleLogin(@Body("token") token: string): Promise<Session> {
    // vérifie le token avec Google (OAuth2Client)
    const payload = await this.authService.verifyGoogleToken(token);
    if (!payload) {
        throw new UnauthorizedException("Invalid Google token");
    }
    // Cherche ou crée l'utilisateur (avec addGoogleUser)
    let user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
        user = await this.usersService.addGoogleUser({
            email: payload.email,
            username: payload.email.split("@")[0],
            firstname: payload.given_name || "Google",
            lastname: payload.family_name || "User",
            mdp: "", // mot de passe vide ou null
        });
    }
    // Crée la session
    return this.authService.createSession(user);

    
}




}
