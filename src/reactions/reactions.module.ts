import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reaction } from "./reactions.entity";
import { ReactionsController } from "./reactions.controller";
import { ReactionsService } from "./reactions.service";
import { UsersModule } from "../users";
import { MessagesModule } from "../messages";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reaction]),
        UsersModule,
        MessagesModule,
    ],
    controllers: [ReactionsController],
    providers: [ReactionsService],
})
export class ReactionsModule {}
