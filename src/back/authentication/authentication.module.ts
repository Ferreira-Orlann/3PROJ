import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./authentication.controller";
import { JwtModule } from "@nestjs/jwt";
import { HttpAuthGuard } from "./http.authentication.guard";
import { AuthService } from "./authentication.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./session.entity";
import { WebSocketAuthGuard } from "./ws.authentication.guard";
import { ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";


@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: "ddd",
                    global: true,
                };
            },
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
