import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permission } from './permissions.entity';
import { UUID } from 'crypto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async getAllPermissions(): Promise<Permission[]> {
    return this.rolesService.findAllPermissions();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
    return this.rolesService.createPermission(createPermissionDto);
  }

  @Get(':uuid')
  async getPermissionById(@Param('uuid') uuid: UUID): Promise<Permission> {
    return this.rolesService.findPermissionById(uuid);
  }
}
