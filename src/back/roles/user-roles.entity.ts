import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './roles.entity';
import { UUID } from 'crypto';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column('uuid')
  userId: UUID;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column('uuid')
  roleId: UUID;

  @Column('uuid', { nullable: true })
  resourceId: UUID;

  @Column({
    type: 'enum',
    enum: ['GLOBAL', 'WORKSPACE', 'CHANNEL', 'USER'],
    default: 'GLOBAL'
  })
  resourceType: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
