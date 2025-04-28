import { UUID } from "crypto";

export class CreateWorkspaceDto {
    name: string;
    description: string;
    owner_uuid: UUID;
    createdAt: Date;
}