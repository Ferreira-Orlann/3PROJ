import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { UpdateNotificationDto } from "./notifications.dto";
import { UUID } from "crypto";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";

@UseGuards(HttpAuthGuard)
@Controller("notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    async getAllNotifications() {
        return await this.notificationsService.findAll();
    }

    @Get("users/:userUuid/notifications")
    async getUserNotifications(@Param("userUuid") userUuid: UUID) {
        return await this.notificationsService.findByRecipient(userUuid);
    }

    @Get("users/:userUuid/notifications/unread")
    async getUnreadUserNotifications(@Param("userUuid") userUuid: UUID) {
        return await this.notificationsService.findUnreadByRecipient(userUuid);
    }

    @Get("users/:userUuid/notifications/:notificationUuid")
    async getNotification(
        @Param("userUuid") userUuid: UUID,
        @Param("notificationUuid") notificationUuid: UUID
    ) {
        return await this.notificationsService.findOneByUuid(notificationUuid);
    }

    @Put("users/:userUuid/notifications/:notificationUuid")
    async updateNotification(
        @Param("userUuid") userUuid: UUID,
        @Param("notificationUuid") notificationUuid: UUID,
        @Body() dto: UpdateNotificationDto
    ) {
        return await this.notificationsService.update(notificationUuid, dto);
    }

    @Put("users/:userUuid/notifications/:notificationUuid/read")
    async markNotificationAsRead(
        @Param("userUuid") userUuid: UUID,
        @Param("notificationUuid") notificationUuid: UUID
    ) {
        return await this.notificationsService.markAsRead(notificationUuid);
    }

    @Put("users/:userUuid/notifications/read-all")
    async markAllNotificationsAsRead(@Param("userUuid") userUuid: UUID) {
        await this.notificationsService.markAllAsRead(userUuid);
        return { success: true };
    }

    @Delete("users/:userUuid/notifications/:notificationUuid")
    async removeNotification(
        @Param("userUuid") userUuid: UUID,
        @Param("notificationUuid") notificationUuid: UUID
    ) {
        await this.notificationsService.remove(notificationUuid);
        return { success: true };
    }
}
