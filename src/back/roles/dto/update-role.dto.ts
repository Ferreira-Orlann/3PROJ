import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { RoleType } from '../roles.types';

export class UpdateRoleDto {
  @IsIn(['ADMIN', 'MEMBER', 'GUEST', 'USER'])
  @IsOptional()
  type?: RoleType;

  @IsString()
  @IsOptional()
  name?: string;

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
