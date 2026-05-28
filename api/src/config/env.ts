export const env = {
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'plantcare-dev-secret-change-me',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'PlantCare <no-reply@plantcare.local>',
    secure: process.env.SMTP_SECURE === 'true',
  },
  port: Number(process.env.PORT) || 3000,
};
