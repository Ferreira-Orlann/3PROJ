import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { HttpAuthGuard } from "./http.auth.guard";
import { jwtConstants } from "./const";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { Session } from "./session.entity";
import { WebSocketAuthGuard } from "./ws.auth.guard";

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            global: true,
        }),
        TypeOrmModule.forFeature([Session]),
        UsersModule,
    ],
    controllers: [AuthController],
    providers: [HttpAuthGuard, WebSocketAuthGuard, AuthService],
    exports: [HttpAuthGuard, WebSocketAuthGuard, AuthService],
})
export class AuthModule {}
