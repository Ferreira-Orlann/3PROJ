import { UUID } from "crypto";

export type Session = {
    uuid: UUID;
    revoked: boolean;
    created_time: Date;
    second_duraction: number;
    token: string;
};
