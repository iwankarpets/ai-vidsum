import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/user.entity.js';
import { AppError } from '../utils/errors.js';
import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

export class AuthService {
  private static readonly userRepository = AppDataSource.getRepository(User);
  private static readonly JWT_SECRET: Secret = process.env.JWT_SECRET || 'secret';
  private static readonly JWT_EXPIRES_IN: NonNullable<SignOptions['expiresIn']> =
    (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ?? '1d';
  static async register(email: string, password: string, name?: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, 'User with this email already exists');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    const user = new User();
    user.email = email;
    user.password = password;
    user.name = name || '';
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = tokenExpires;

    await this.userRepository.save(user);

    const token = this.generateToken(user);
    return { user, token };
  }

  static generateToken(user: User): string {
    return jwt.sign({ userId: user.id, email: user.email }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }
}
