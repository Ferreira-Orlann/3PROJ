import { ApiProperty, ApiSchema, OmitType } from "@nestjs/swagger";
import { User } from "./users.entity";

@ApiSchema()
export class CreateUserDto extends OmitType(User, ["uuid"]) {}
