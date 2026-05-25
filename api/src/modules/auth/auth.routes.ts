import { Router, type Request, type Response } from 'express';

import { sendError } from '../../shared/errors.js';
import { isValidEmail, isValidPassword } from '../../shared/validation.js';
import { loginUser, registerUser } from './auth.service.js';
import { createToken } from './auth.utils.js';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !isValidPassword(password)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Email musi być poprawny, a hasło mieć minimum 8 znaków.');
    return;
  }

  const user = await registerUser(email, password);

  if (!user) {
    sendError(res, 409, 'EMAIL_TAKEN', 'Konto z takim adresem email już istnieje.');
    return;
  }

  res.status(201).json({
    user,
    token: createToken(user),
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

  res.json({
    user,
    token: createToken(user),
  });
});
