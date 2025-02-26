import { UUID } from "crypto";

export class CreateReactionDto {
    emoji: string;
    user_uuid: UUID;
    message_uuid: UUID;
}
