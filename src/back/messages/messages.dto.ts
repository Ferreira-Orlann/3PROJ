import { UUID } from "crypto";

export class CreateMessageDto {
    message: string;
    is_public: boolean;
    source_uuid: UUID;
    destination_uuid: UUID;
    
}
