import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @Column({ type: 'varchar', unique: true })
  declare email: string;

  @Column({ type: 'varchar', select: false })
  declare password: string;

  @Column({ type: 'varchar', nullable: true })
  declare name: string | null;

  @Column({ type: 'boolean', default: false })
  declare isEmailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  declare emailVerificationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  declare emailVerificationTokenExpires: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  declare lastLogin: Date | null;

  @CreateDateColumn()
  declare createdAt: Date;

  @UpdateDateColumn()
  declare updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
