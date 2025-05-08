import { UUID } from "crypto"

export type WorkspaceVisibility = "public" | "private"

export type Workspace = {
    name: string,
    description: string
    is_public: boolean
    owner_uuid: UUID,
    uuid: UUID
    createdAt: Date
}