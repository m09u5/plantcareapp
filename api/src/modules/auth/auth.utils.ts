import crypto from 'node:crypto';

import { env } from '../../config/env.js';
import type { AuthUser, JwtPayload } from './auth.types.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_ITERATIONS = 120_000;
const PASSWORD_KEY_LENGTH = 32;

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function signJwtPayload(header: string, payload: string) {
  return crypto.createHmac('sha256', env.jwtSecret).update(`${header}.${payload}`).digest('base64url');
}

export function createToken(user: AuthUser) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }),
  );
  const signature = signJwtPayload(header, payload);

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): JwtPayload | null {
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = signJwtPayload(header, payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<JwtPayload>;

    if (
      typeof parsed.sub !== 'number' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.exp !== 'number' ||
      parsed.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return { sub: parsed.sub, email: parsed.email, exp: parsed.exp };
  } catch {
    return null;
  }
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto
    .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, 'sha256')
    .toString('base64url');

  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  const [algorithm, iterationsValue, salt, storedHash] = storedPassword.split('$');
  const iterations = Number(iterationsValue);

  if (algorithm !== 'pbkdf2' || !Number.isInteger(iterations) || !salt || !storedHash) {
    return false;
  }

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, PASSWORD_KEY_LENGTH, 'sha256')
    .toString('base64url');
  const hashBuffer = Buffer.from(hash);
  const storedHashBuffer = Buffer.from(storedHash);

  return hashBuffer.length === storedHashBuffer.length && crypto.timingSafeEqual(hashBuffer, storedHashBuffer);
}

export function createEmailVerificationToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashEmailVerificationToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('base64url');
}
