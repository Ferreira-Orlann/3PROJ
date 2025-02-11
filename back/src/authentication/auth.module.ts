import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./auth.guard";
import { jwtConstants } from "./const";

@Module({
    imports: [JwtModule.register({ secret: jwtConstants.secret })],
    controllers: [AuthController],
    providers: [AuthGuard],
    exports: [AuthGuard, JwtModule]
})
export class AuthModule {}
