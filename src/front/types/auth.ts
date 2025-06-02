import { UUID } from "crypto";

export type Session = {
    uuid: UUID;
    owner: UUID;               // <-- ajoute cette ligne

    revoked: boolean;
    created_time: Date;
    second_duraction: number;
    token: string;
};
