import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PermissionScope, PermissionType } from './roles.types';
import { Role } from './roles.entity';
import { UUID } from 'crypto';
import { Expose } from 'class-transformer';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  uuid: UUID;

  @Column({
    type: 'enum',
    enum: [
      'PUBLISH', 'EDIT', 'DELETE',
      'MODERATE', 'APPROVE', 'REJECT',
      'MANAGE_MEMBERS', 'INVITE_MEMBERS', 'REMOVE_MEMBERS',
      'MANAGE_WORKSPACE', 'VIEW_WORKSPACE', 'READ'
    ]
  })
  @Expose()
  type: PermissionType;

  @Column()
  @Expose()
  name: string;

  @Column({ nullable: true })
  @Expose()
  description: string;

  @Column({
    type: 'enum',
    enum: ['GLOBAL', 'WORKSPACE', 'CHANNEL', 'USER'],
    default: 'WORKSPACE'
  })
  @Expose()
  scope: PermissionScope;

  @ManyToMany(() => Role, role => role.permissions)
  @Expose()
  roles: Role[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Expose()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Expose()
  updatedAt: Date;
}
