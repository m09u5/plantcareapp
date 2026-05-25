import type { NextFunction, Request, Response } from 'express';

import { sendError } from '../../shared/errors.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { verifyToken } from './auth.utils.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    sendError(res, 401, 'UNAUTHORIZED', 'Brak tokenu autoryzacji.');
    return;
  }

  const payload = verifyToken(token);

  if (!payload) {
    sendError(res, 401, 'UNAUTHORIZED', 'Token jest niepoprawny albo wygasł.');
    return;
  }

  (req as AuthenticatedRequest).user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
}
