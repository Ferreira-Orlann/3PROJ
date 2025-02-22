import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./users.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AuthModule } from "src/authentication/authentication.module";
import { AuthorizationModule } from "src/authorization/authorization.module";

@Module({
    imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User]), AuthorizationModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
