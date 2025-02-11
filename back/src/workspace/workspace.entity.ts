import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string

  @Column({ default: true })
  isActive: boolean;
}