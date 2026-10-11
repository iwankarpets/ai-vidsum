import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar', unique: true })
  declare tokenHash: string;

  @Column({ type: 'timestamp' })
  declare expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  declare revokedAt: Date | null;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  declare user: User;

  @CreateDateColumn()
  declare createdAt: Date;
}
