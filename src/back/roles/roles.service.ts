import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';
import { Permission } from './permissions.entity';
import { UserRole } from './user-roles.entity';
import { UUID } from 'crypto';
import { PermissionType, RoleType } from './roles.types';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  // Role management
  async findAllRoles(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async findRoleById(uuid: UUID): Promise<Role> {
    return this.rolesRepository.findOne({ 
      where: { uuid },
      relations: ['permissions'] 
    });
  }

  async findRoleByType(type: RoleType): Promise<Role> {
    return this.rolesRepository.findOne({ 
      where: { type },
      relations: ['permissions'] 
    });
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create({
      type: createRoleDto.type,
      name: createRoleDto.name,
      description: createRoleDto.description,
      isDefault: createRoleDto.isDefault ?? false,
      isSystem: createRoleDto.isSystem ?? false
    });
    return this.rolesRepository.save(role);
  }

  async updateRole(uuid: UUID, updateRoleDto: UpdateRoleDto): Promise<Role> {
    await this.rolesRepository.update(uuid, updateRoleDto);
    return this.findRoleById(uuid);
  }

  async deleteRole(uuid: UUID): Promise<void> {
    await this.rolesRepository.delete(uuid);
  }

  // Permission management
  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  async findPermissionById(uuid: UUID): Promise<Permission> {
    return this.permissionsRepository.findOne({ where: { uuid } });
  }

  async findPermissionsByType(type: PermissionType): Promise<Permission[]> {
    return this.permissionsRepository.find({ where: { type } });
  }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create({
      type: createPermissionDto.type,
      name: createPermissionDto.name,
      description: createPermissionDto.description,
      scope: createPermissionDto.scope || 'WORKSPACE'
    });
    return this.permissionsRepository.save(permission);
  }

  // Role-Permission management
  async addPermissionToRole(roleId: UUID, permissionId: UUID): Promise<Role> {
    const role = await this.findRoleById(roleId);
    const permission = await this.findPermissionById(permissionId);
    
    if (role && permission) { 
      role.permissions = [...role.permissions, permission];
      return this.rolesRepository.save(role);
    }
    
    throw new Error('Role or permission not found');
  }

  async removePermissionFromRole(roleId: UUID, permissionId: UUID): Promise<Role> {
    const role = await this.findRoleById(roleId);
    
    if (role) {
      role.permissions = role.permissions.filter(p => p.uuid !== permissionId);
      return this.rolesRepository.save(role);
    }
    
    throw new Error('Role not found');
  }

  // User-Role management
  async assignRoleToUser(userId: UUID, roleId: UUID, resourceId?: UUID, resourceType?: string): Promise<UserRole> {
    const userRole = this.userRolesRepository.create({
      userId,
      roleId,
      resourceId,
      resourceType,
    });
    
    return this.userRolesRepository.save(userRole);
  }

  async removeRoleFromUser(userRoleId: UUID): Promise<void> {
    await this.userRolesRepository.delete(userRoleId);
  }

  async getUserRoles(userId: UUID): Promise<UserRole[]> {
    return this.userRolesRepository.find({
      where: { userId },
      relations: ['role', 'role.permissions']
    });
  }

  async getUserRolesForResource(userId: UUID, resourceId: UUID, resourceType: string): Promise<UserRole[]> {
    return this.userRolesRepository.find({
      where: { 
        userId,
        resourceId,
        resourceType
      },
      relations: ['role', 'role.permissions']
    });
  }

  // Check if user has a specific permission
  async userHasPermission(userId: UUID, permissionType: PermissionType, resourceId?: UUID, resourceType?: string): Promise<boolean> {
    // Get all user roles
    const userRoles = await this.getUserRoles(userId);
    
    // Check global permissions first
    const hasGlobalPermission = userRoles.some(userRole => 
      userRole.resourceType === 'GLOBAL' && 
      userRole.role.permissions.some(permission => permission.type === permissionType)
    );
    
    if (hasGlobalPermission) {
      return true;
    }
    
    // If resourceId is provided, check specific resource permissions
    if (resourceId && resourceType) {
      const resourceRoles = await this.getUserRolesForResource(userId, resourceId, resourceType);
      return resourceRoles.some(userRole => 
        userRole.role.permissions.some(permission => permission.type === permissionType)
      );
    }
    
    return false;
  }
}
