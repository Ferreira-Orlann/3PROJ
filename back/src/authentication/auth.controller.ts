import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UUID } from "crypto";

@Controller("auth")
export class AuthController {
    constructor(private jwtService: JwtService) {}

    @Get("signin")
    async signin(@Query("uuid") uuid: UUID) {
        return {
            access_token: await this.jwtService.signAsync(uuid),
        };
    }
}
