import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "../authentication/authentication.module";
import { AuthorizationModule } from "../authorization/authorization.module";

@Module({
    imports: [
        forwardRef(() => AuthModule),
        TypeOrmModule.forFeature([User]),
        AuthorizationModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
