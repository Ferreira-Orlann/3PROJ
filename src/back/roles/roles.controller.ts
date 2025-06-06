import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './roles.entity';
import { Permission } from './permissions.entity';
import { UserRole } from './user-roles.entity';
import { UUID } from 'crypto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Role endpoints
  @Get()
  async getAllRoles(): Promise<Role[]> {
    return this.rolesService.findAllRoles();
  }

  @Get(':uuid')
  async getRoleById(@Param('uuid') uuid: UUID): Promise<Role> {
    return this.rolesService.findRoleById(uuid);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  @Put(':uuid')
  @UsePipes(new ValidationPipe())
  async updateRole(@Param('uuid') uuid: UUID, @Body() updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.rolesService.updateRole(uuid, updateRoleDto);
  }

  @Delete(':uuid')
  async deleteRole(@Param('uuid') uuid: UUID): Promise<void> {
    return this.rolesService.deleteRole(uuid);
  }

  // Permission endpoints ont été déplacés vers PermissionsController

  // Role-Permission management
  @Post(':roleUuid/permissions/:permissionUuid')
  async addPermissionToRole(
    @Param('roleUuid') roleUuid: UUID,
    @Param('permissionUuid') permissionUuid: UUID
  ): Promise<Role> {
    return this.rolesService.addPermissionToRole(roleUuid, permissionUuid);
  }

  @Delete(':roleUuid/permissions/:permissionUuid')
  async removePermissionFromRole(
    @Param('roleUuid') roleUuid: UUID,
    @Param('permissionUuid') permissionUuid: UUID
  ): Promise<Role> {
    return this.rolesService.removePermissionFromRole(roleUuid, permissionUuid);
  }

  // User-Role management
  @Post('users/:userId/roles/:roleUuid')
  async assignRoleToUser(
    @Param('userId') userId: UUID,
    @Param('roleUuid') roleUuid: UUID,
    @Body() data: { resourceId?: UUID; resourceType?: string }
  ): Promise<UserRole> {
    return this.rolesService.assignRoleToUser(
      userId,
      roleUuid,
      data.resourceId,
      data.resourceType
    );
  }

  @Delete('user-roles/:userRoleId')
  async removeRoleFromUser(@Param('userRoleId') userRoleId: UUID): Promise<void> {
    return this.rolesService.removeRoleFromUser(userRoleId);
  }

  @Get('users/:userId/roles')
  async getUserRoles(@Param('userId') userId: UUID): Promise<UserRole[]> {
    return this.rolesService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions/:permissionType')
  async checkUserPermission(
    @Param('userId') userId: UUID,
    @Param('permissionType') permissionType: string,
    @Body() data: { resourceId?: UUID; resourceType?: string }
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.rolesService.userHasPermission(
      userId,
      permissionType as any,
      data.resourceId,
      data.resourceType
    );
    
    return { hasPermission };
  }
}
