import { Router, type Request, type Response } from 'express';

import { sendError } from '../../shared/errors.js';
import { isValidEmail, isValidPassword } from '../../shared/validation.js';
import {
  createNewEmailVerificationToken,
  loginUser,
  registerUser,
  verifyUserEmail,
} from './auth.service.js';
import { createToken } from './auth.utils.js';
import { sendVerificationEmail } from './email.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !isValidPassword(password)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Email musi być poprawny, a hasło mieć minimum 8 znaków.');
    return;
  }

  const registration = await registerUser(email, password);

  if (!registration) {
    sendError(res, 409, 'EMAIL_TAKEN', 'Konto z takim adresem email już istnieje.');
    return;
  }

  await sendVerificationEmail(registration.user.email, registration.verificationToken);

  res.status(201).json({
    user: registration.user,
    message: 'Konto zostało utworzone. Sprawdź email i aktywuj konto przed logowaniem.',
  });
});

authRouter.get('/verify-email', async (req: Request, res: Response) => {
  const token = req.query.token;

  if (typeof token !== 'string' || !token) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Brakuje tokenu aktywacyjnego.');
    return;
  }

  const user = await verifyUserEmail(token);

  if (!user) {
    sendError(res, 400, 'INVALID_VERIFICATION_TOKEN', 'Link aktywacyjny jest niepoprawny albo wygasł.');
    return;
  }

  res.json({
    user,
    message: 'Konto zostało aktywowane. Możesz się teraz zalogować.',
  });
});

authRouter.post('/resend-verification', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Podaj poprawny email.');
    return;
  }

  const verification = await createNewEmailVerificationToken(email);

  if (verification) {
    await sendVerificationEmail(verification.email, verification.verificationToken);
  }

  res.json({
    message: 'Jeśli konto istnieje i nie jest aktywne, wysłaliśmy nowy link aktywacyjny.',
  });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || typeof password !== 'string') {
    sendError(res, 400, 'VALIDATION_ERROR', 'Podaj poprawny email i hasło.');
    return;
  }

  const user = await loginUser(email, password);

  if (!user) {
    sendError(res, 401, 'INVALID_CREDENTIALS', 'Niepoprawny email lub hasło.');
    return;
  }

  if (user === 'EMAIL_NOT_VERIFIED') {
    sendError(res, 403, 'EMAIL_NOT_VERIFIED', 'Aktywuj konto linkiem z emaila przed logowaniem.');
    return;
  }

  res.json({
    user,
    token: createToken(user),
  });
});
