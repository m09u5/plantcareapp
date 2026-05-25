import { Router, type Request, type Response } from 'express';

import { requireAuth } from '../auth/auth.middleware.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { sendError } from '../../shared/errors.js';
import { isValidInterval, isValidPlantName } from '../../shared/validation.js';
import {
  createUserPlant,
  deleteUserPlant,
  getUserPlants,
  updateUserPlant,
  waterUserPlant,
} from './plants.service.js';
import { withPlantStatus } from './plants.utils.js';

export const plantsRouter = Router();

plantsRouter.use(requireAuth);

plantsRouter.get('/', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const plants = await getUserPlants(user.id);

  res.json(plants.map(withPlantStatus));
});

plantsRouter.post('/', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { name, interval } = req.body;

  if (!isValidPlantName(name) || !isValidInterval(interval)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Nazwa musi mieć minimum 2 znaki, a interwał od 1 do 365 dni.');
    return;
  }

  const newPlant = await createUserPlant(user.id, name, interval);

  res.status(201).json(withPlantStatus(newPlant));
});

plantsRouter.put('/:id', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const plantId = Number(req.params.id);
  const { name, interval } = req.body;

  if (!Number.isInteger(plantId)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Id rośliny musi być liczbą.');
    return;
  }

  if (!isValidPlantName(name) || !isValidInterval(interval)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Nazwa musi mieć minimum 2 znaki, a interwał od 1 do 365 dni.');
    return;
  }

  const updatedPlant = await updateUserPlant(user.id, plantId, name, interval);

  if (!updatedPlant) {
    sendError(res, 404, 'PLANT_NOT_FOUND', 'Nie znaleziono rośliny.');
    return;
  }

  res.json(withPlantStatus(updatedPlant));
});

plantsRouter.delete('/:id', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const plantId = Number(req.params.id);

  if (!Number.isInteger(plantId)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Id rośliny musi być liczbą.');
    return;
  }

  const wasDeleted = await deleteUserPlant(user.id, plantId);

  if (!wasDeleted) {
    sendError(res, 404, 'PLANT_NOT_FOUND', 'Nie znaleziono rośliny.');
    return;
  }

  res.status(204).send();
});

plantsRouter.patch('/:id/water', async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const plantId = Number(req.params.id);

  if (!Number.isInteger(plantId)) {
    sendError(res, 400, 'VALIDATION_ERROR', 'Id rośliny musi być liczbą.');
    return;
  }

  const updatedPlant = await waterUserPlant(user.id, plantId);

  if (!updatedPlant) {
    sendError(res, 404, 'PLANT_NOT_FOUND', 'Nie znaleziono rośliny.');
    return;
  }

  res.json(withPlantStatus(updatedPlant));
});
