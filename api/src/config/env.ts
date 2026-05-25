export const env = {
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'plantcare-dev-secret-change-me',
  port: Number(process.env.PORT) || 3000,
};
