import { UUID } from "crypto";
export class CreateChannelDto {
    name: string;
    description: string;
    workspace_uuid: UUID;
    creator_uuid: UUID;
    is_public: boolean;
    createdAt: Date;
}
