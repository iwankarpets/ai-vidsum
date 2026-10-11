import { type User } from '../entities/user.entity.js';

export const toPublicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  isEmailVerified: user.isEmailVerified,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});