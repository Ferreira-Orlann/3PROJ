import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleType } from './roles.types';
import { Permission } from './permissions.entity';
import { UUID } from 'crypto';
import { Expose } from 'class-transformer';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  uuid: UUID;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MEMBER', 'GUEST', 'USER'],
    default: 'USER'
  })
  @Expose()
  type: RoleType;

  @Column()
  @Expose()
  name: string;

  @Column({ nullable: true })
  @Expose()
  description: string;

  @Column({ default: false })
  @Expose()
  isDefault: boolean;

  @Column({ default: false })
  @Expose()
  isSystem: boolean;

  @ManyToMany(() => Permission)
  @Expose()
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'uuid'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'uuid'
    }
  })
  permissions: Permission[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Expose()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  @Expose()
  updatedAt: Date;
}
