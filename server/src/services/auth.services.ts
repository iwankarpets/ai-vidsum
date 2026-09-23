import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from '../config/database.js';
import { User } from '../entities/user.entity.js';
import { AppError } from '../utils/errors.js';
import crypto from 'crypto';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { EmailService } from './email.service.js';

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

    await EmailService.sendVerificationEmail(email, emailVerificationToken);

    const token = this.generateToken(user);
    return { user, token };
  }

  static generateToken(user: User): string {
    return jwt.sign({ userId: user.id, email: user.email }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid verification token');
    }

    if (!user.emailVerificationTokenExpires || user.emailVerificationTokenExpires < new Date()) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Verification token expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await this.userRepository.save(user);

    await EmailService.sendWelcomeEmail(user.email, user.name ?? 'There');

    return { message: 'Email verified succesfully' };
  }

  static async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User not found');
    }

    if (user.isEmailVerified) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email already verified');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date();
    tokenExpires.setHours(tokenExpires.getHours() + 24);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = tokenExpires;

    await this.userRepository.save(user);

    await EmailService.sendVerificationEmail(email, emailVerificationToken);

    return { message: 'Verification email sent' };
  }

  static async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        isEmailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);

    const { password: _password, ...safeUser } = user;

    return { user: safeUser, token };
  }
}
