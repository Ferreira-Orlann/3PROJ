import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { HttpAuthGuard } from "./http.auth.guard";
import { jwtConstants } from "./const";

@Module({
    imports: [JwtModule.register({ secret: jwtConstants.secret, global: true})],
    controllers: [AuthController],
    providers: [HttpAuthGuard],
    exports: [HttpAuthGuard]
})
export class AuthModule {}
