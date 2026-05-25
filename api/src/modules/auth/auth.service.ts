import { prisma } from '../../db/prisma.js';
import { hashPassword, verifyPassword } from './auth.utils.js';

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    return null;
  }

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashPassword(password),
    },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !verifyPassword(password, user.password)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}
