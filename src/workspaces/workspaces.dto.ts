import { UUID } from "crypto";

export class CreateWorkspaceDto {
    name: string;
    owner_uuid: UUID;
}
