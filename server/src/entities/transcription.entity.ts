import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video } from './video.entity.js';

@Entity()
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'text' })
  declare text: string;

  @Column({ type: 'float' })
  declare confidence: number;

  @Column({ type: 'boolean' })
  declare isMusic: boolean;

  @Column({ type: 'varchar' })
  declare audioPath: string;

  @OneToOne(() => Video, (video) => video.transcription)
  @JoinColumn()
  declare video: Video;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;
}
