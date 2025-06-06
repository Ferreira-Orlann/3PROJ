import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleType } from '../roles.types';

export class CreateRoleDto {
  @IsIn(['ADMIN', 'MEMBER', 'GUEST', 'USER'])
  @IsNotEmpty()
  type: RoleType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}
