import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { type User } from './user.entity.js';

export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar' })
  declare url: string;

  @Column({ type: 'varchar' })
  declare title: string;

  @Column({ type: 'text', nullable: true })
  declare description: string | null;

  @Column({ type: 'int' })
  declare duration: number;

  @Column({ type: 'text', nullable: true })
  declare thumbnail: string | null;

  @Column({ type: 'varchar', default: 'pending' })
  declare status: VideoStatus;

  @ManyToOne('User', 'videos', { nullable: false })
  declare user: User;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
