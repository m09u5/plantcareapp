export function getPlantStatus(lastWatered: Date, interval: number) {
  const nextWateringAt = new Date(lastWatered);
  nextWateringAt.setDate(nextWateringAt.getDate() + interval);

  return {
    nextWateringAt,
    status: nextWateringAt <= new Date() ? 'needs_watering' : 'ok',
  };
}

export function withPlantStatus<T extends { lastWatered: Date; interval: number }>(plant: T) {
  return {
    ...plant,
    ...getPlantStatus(plant.lastWatered, plant.interval),
  };
}
