import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

import { env } from '../config/env.js';

const adapter = new PrismaLibSql({
  url: env.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });
