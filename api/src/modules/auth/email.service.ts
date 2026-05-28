import nodemailer from 'nodemailer';

import { env } from '../../config/env.js';

function getVerificationUrl(token: string) {
  return `${env.appUrl.replace(/\/$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function canSendEmail() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = getVerificationUrl(token);

  if (!canSendEmail()) {
    console.log(`Link aktywacyjny dla ${email}: ${verificationUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to: email,
    subject: 'Aktywuj konto PlantCare',
    text: [
      'Czesc!',
      '',
      'Kliknij link, aby aktywowac konto PlantCare:',
      verificationUrl,
      '',
      'Link wygasnie za 24 godziny.',
    ].join('\n'),
    html: `
      <p>Czesc!</p>
      <p>Kliknij link, aby aktywowac konto PlantCare:</p>
      <p><a href="${verificationUrl}">Aktywuj konto</a></p>
      <p>Link wygasnie za 24 godziny.</p>
    `,
  });
}
