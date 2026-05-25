import { prisma } from '../../db/prisma.js';

export async function getUserPlants(userId: number) {
  return prisma.plant.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
  });
}

export async function createUserPlant(userId: number, name: string, interval: number) {
  return prisma.plant.create({
    data: {
      name: name.trim(),
      interval,
      userId,
    },
  });
}

export async function updateUserPlant(userId: number, plantId: number, name: string, interval: number) {
  const existingPlant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!existingPlant) {
    return null;
  }

  return prisma.plant.update({
    where: { id: plantId },
    data: {
      name: name.trim(),
      interval,
    },
  });
}

export async function deleteUserPlant(userId: number, plantId: number) {
  const existingPlant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!existingPlant) {
    return false;
  }

  await prisma.plant.delete({ where: { id: plantId } });
  return true;
}

export async function waterUserPlant(userId: number, plantId: number) {
  const existingPlant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!existingPlant) {
    return null;
  }

  return prisma.plant.update({
    where: { id: plantId },
    data: {
      lastWatered: new Date(),
    },
  });
}
