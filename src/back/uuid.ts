import { UUID } from "crypto";
import { User } from "./users/users.entity";

export interface UUIDHolder {
    uuid: UUID;
}

export const UUIDHolderTransform = ({ value }: { value: User }) => {
    if (typeof value === "string" || value instanceof String) {
        return value;
    }
    return value.uuid;
};
