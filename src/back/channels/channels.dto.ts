import { UUID } from "crypto";
export class CreateChannelDto {
    name: string;
    id_public: boolean;
    workspace_uuid: UUID;
    creator_uuid: UUID;
}
