import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reaction } from "./reaction.entity";
import { ReactionsController } from "./reactions.controller";
import { ReactionsService } from "./reactions.service";
import { User } from "../users/users.entity";
import { Message } from "../messages/messages.entity";
import { UsersModule } from "../users/users.module";
import { MessagesModule } from "../messages/messages.module";

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
