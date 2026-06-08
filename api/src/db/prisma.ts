import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { env } from '../config/env.js';

const adapter = new PrismaLibSql({ url: env.databaseUrl });
export const prisma = new PrismaClient({ adapter });