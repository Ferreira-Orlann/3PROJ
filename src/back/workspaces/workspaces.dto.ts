import { UUID } from "crypto";

export class CreateWorkspaceDto {
    name: string;
    description: string;
    is_public: boolean;
    owner_uuid: UUID;
    createdAt: Date;
}
