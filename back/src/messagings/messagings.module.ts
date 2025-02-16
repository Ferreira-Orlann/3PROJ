import { Module } from "@nestjs/common";
import { MessagingsController } from "./messagings.controller";
import { MessagingsService } from "./messagings.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Messaging } from "./messagings.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Messaging])],
    controllers: [MessagingsController],
    providers: [MessagingsService],
})
export class MessagingsModule {}
