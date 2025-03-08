import { UUID } from "crypto";

export class CreateUserDto {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    address: string;
}

export type OutputUserDto = CreateUserDto & {
    uuid: UUID
}

