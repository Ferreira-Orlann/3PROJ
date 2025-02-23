import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./authentication.controller";
import { JwtModule } from "@nestjs/jwt";
import { HttpAuthGuard } from "./http.authentication.guard";
import { AuthService } from "./authentication.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { Session } from "./session.entity";
import { WebSocketAuthGuard } from "./ws.authentication.guard";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: "ddd",
                    global: true,
                }
            },
            global: true
        }),
        TypeOrmModule.forFeature([Session]),
        forwardRef(() => UsersModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, HttpAuthGuard, WebSocketAuthGuard],
    exports: [AuthService, HttpAuthGuard, WebSocketAuthGuard],
})
export class AuthModule {}
