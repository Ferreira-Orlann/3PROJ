import { UUID } from "crypto";

export class CreateMessageDto {
    message: string;
    is_public: boolean;
    user_uuid: UUID;
    channel_uuid: UUID;
}