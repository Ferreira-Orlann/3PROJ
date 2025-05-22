import { UUID } from "crypto";
import { NotificationType } from "./notification.entity";

export class CreateNotificationDto {
    type: NotificationType;
    recipient_uuid: UUID;
    sender_uuid?: UUID;
    message_uuid?: UUID;
    channel_uuid?: UUID;
    workspace_uuid?: UUID;
    reaction_uuid?: UUID;
    content?: string;
}

export class UpdateNotificationDto {
    read?: boolean;
}
