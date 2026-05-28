import { prisma } from '../../db/prisma.js';
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
  hashPassword,
  verifyPassword,
} from './auth.utils.js';

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

function getEmailVerificationExpiresAt() {
  return new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) {
    return null;
  }

  const verificationToken = createEmailVerificationToken();
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashPassword(password),
      emailVerificationTokenHash: hashEmailVerificationToken(verificationToken),
      emailVerificationExpiresAt: getEmailVerificationExpiresAt(),
    },
    select: {
      id: true,
      email: true,
    },
  });

  return { user, verificationToken };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || !verifyPassword(password, user.password)) {
    return null;
  }

  if (!user.isVerified) {
    return 'EMAIL_NOT_VERIFIED' as const;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function verifyUserEmail(token: string) {
  const tokenHash = hashEmailVerificationToken(token);
  const user = await prisma.user.findUnique({
    where: { emailVerificationTokenHash: tokenHash },
  });

  if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    return null;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function createNewEmailVerificationToken(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user || user.isVerified) {
    return null;
  }

  const verificationToken = createEmailVerificationToken();
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationTokenHash: hashEmailVerificationToken(verificationToken),
      emailVerificationExpiresAt: getEmailVerificationExpiresAt(),
    },
    select: {
      email: true,
    },
  });

  return { email: updatedUser.email, verificationToken };
}
