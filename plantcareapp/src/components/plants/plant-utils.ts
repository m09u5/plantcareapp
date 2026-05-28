import type { Plant } from '@/lib/api';

export const demoPlants: Plant[] = [
  {
    id: -1,
    name: "Prince's Rose",
    interval: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=600&q=80',
    lastWatered: new Date().toISOString(),
    nextWateringAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ok',
    userId: 0,
  },
  {
    id: -2,
    name: 'Living room Bonsai',
    interval: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=600&q=80',
    lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextWateringAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ok',
    userId: 0,
  },
  {
    id: -3,
    name: 'Living room Bonsai',
    interval: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?auto=format&fit=crop&w=600&q=80',
    lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextWateringAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'needs_watering',
    userId: 0,
  },
];

export function daysAgoLabel(dateValue: string) {
  const date = new Date(dateValue).getTime();
  const diff = Math.max(0, Math.floor((Date.now() - date) / (24 * 60 * 60 * 1000)));

  if (diff === 0) {
    return 'Watered: Today';
  }

  return `Watered: ${diff} days ago`;
}

export function getNote(plant: Plant) {
  if (plant.name === 'Living room Bonsai') {
    return 'Bonsai requires a lot of water and lots of sunlight. Buy special soil.';
  }

  return '';
}

export function getWaterLevel(plant: Plant) {
  const wateredAt = new Date(plant.lastWatered).getTime();
  const elapsedDays = Math.max(0, (Date.now() - wateredAt) / (24 * 60 * 60 * 1000));
  const remainingRatio = 1 - elapsedDays / plant.interval;

  return Math.max(0.06, Math.min(1, remainingRatio));
}
