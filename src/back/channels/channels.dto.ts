import { UUID } from "crypto";
export class CreateChannelDto {
    name: string;
    workspace_uuid: UUID;
    creator_uuid: UUID;
}
