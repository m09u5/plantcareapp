import { prisma } from '../../db/prisma.js';

export async function getUserPlants(userId: number) {
  return prisma.plant.findMany({
    where: { userId },
    orderBy: { id: 'desc' },
  });
}

function normalizeImageUrl(imageUrl?: string | null) {
  return imageUrl?.trim() || null;
}

export async function createUserPlant(userId: number, name: string, interval: number, imageUrl?: string | null) {
  return prisma.plant.create({
    data: {
      name: name.trim(),
      interval,
      imageUrl: normalizeImageUrl(imageUrl),
      userId,
    },
  });
}

export async function updateUserPlant(
  userId: number,
  plantId: number,
  name: string,
  interval: number,
  imageUrl?: string | null,
) {
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
      ...(imageUrl !== undefined ? { imageUrl: normalizeImageUrl(imageUrl) } : {}),
    },
  });
}

export async function updateUserPlantPhoto(userId: number, plantId: number, imageUrl?: string | null) {
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
      imageUrl: normalizeImageUrl(imageUrl),
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
