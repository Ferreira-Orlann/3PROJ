import { UUID } from "crypto";

export type Session = {
    uuid: UUID;
    revoked: boolean;
    second_duraction: number;
    token: string;
};
