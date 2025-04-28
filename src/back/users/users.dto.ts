import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { User } from "./users.entity";
import { OmitType } from "@nestjs/mapped-types";

@ApiSchema()
export class CreateUserDto extends OmitType(User, ["uuid"]) {}
