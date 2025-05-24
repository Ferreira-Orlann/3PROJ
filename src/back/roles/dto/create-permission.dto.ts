import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PermissionScope, PermissionType } from '../roles.types';

export class CreatePermissionDto {
  @IsIn([
    'PUBLISH', 'EDIT', 'DELETE',
    'MODERATE', 'APPROVE', 'REJECT',
    'MANAGE_MEMBERS', 'INVITE_MEMBERS', 'REMOVE_MEMBERS',
    'MANAGE_WORKSPACE', 'VIEW_WORKSPACE', 'READ'
  ])
  @IsNotEmpty()
  type: PermissionType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['GLOBAL', 'WORKSPACE', 'CHANNEL', 'USER'])
  @IsOptional()
  scope?: PermissionScope;
}
