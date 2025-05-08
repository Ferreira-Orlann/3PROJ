import { UUID } from "typeorm/driver/mongodb/bson.typings";

export type UserStatus = "online" | "offline"

export type User = {
    uuid: UUID;
    username: string;
    status: UserStatus;
    firstname: string;
    lastname: string;
    email: string;
    address: string;
}