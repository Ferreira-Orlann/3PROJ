import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./authentication.controller";
import { JwtModule } from "@nestjs/jwt";
import { HttpAuthGuard } from "./http.authentication.guard";
import { jwtConstants } from "./const";
import { AuthService } from "./authentication.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { Session } from "./session.entity";
import { WebSocketAuthGuard } from "./ws.authentication.guard";

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            global: true,
        }),
        TypeOrmModule.forFeature([Session]),
        forwardRef(() => UsersModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, HttpAuthGuard, WebSocketAuthGuard],
    exports: [AuthService, HttpAuthGuard, WebSocketAuthGuard],
})
export class AuthModule {}
