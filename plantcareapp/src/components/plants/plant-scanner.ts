import type { DraftPlant } from './plant-types';

type PlantIdSuggestion = {
  plant_details?: {
    common_names?: string[];
    scientific_name?: string;
    url?: string;
    wiki_description?: {
      value?: string;
    };
    watering?: unknown;
  };
  plant_name?: string;
  probability?: number;
};

type PlantIdResponse = {
  suggestions?: PlantIdSuggestion[];
};

const plantIdApiKey = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY;
const defaultIntervalDays = 7;

export async function identifyPlantFromPhoto(base64Image: string, imageUrl: string): Promise<DraftPlant> {
  if (!plantIdApiKey) {
    throw new Error('Dodaj EXPO_PUBLIC_PLANT_ID_API_KEY, aby rozpoznawanie roslin moglo dzialac.');
  }

  const response = await fetch('https://api.plant.id/v2/identify', {
    method: 'POST',
    headers: {
      'Api-Key': plantIdApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images: [base64Image],
      plant_details: ['common_names', 'scientific_name', 'url', 'wiki_description', 'watering'],
    }),
  });

  if (!response.ok) {
    throw new Error('Nie udalo sie rozpoznac rosliny na tym zdjeciu.');
  }

  const data = (await response.json()) as PlantIdResponse;
  const suggestion = data.suggestions?.[0];

  if (!suggestion) {
    throw new Error('Model nie znalazl pewnego dopasowania dla tego zdjecia.');
  }

  const details = suggestion.plant_details;
  const commonName = details?.common_names?.[0];
  const scientificName = details?.scientific_name ?? suggestion.plant_name;
  const name = commonName ?? scientificName ?? 'Scanned plant';
  const probability = typeof suggestion.probability === 'number' ? Math.round(suggestion.probability * 100) : null;
  const description = details?.wiki_description?.value;
  const noteParts = [
    probability ? `Match: ${probability}%` : null,
    scientificName && scientificName !== name ? `Scientific name: ${scientificName}` : null,
    description ? trimDescription(description) : null,
    details?.url ? `More: ${details.url}` : null,
  ].filter(Boolean);

  return {
    name,
    note: noteParts.join('\n\n'),
    interval: getWateringInterval(details?.watering),
    imageUrl,
  };
}

function trimDescription(description: string) {
  const cleanDescription = description.replace(/\s+/g, ' ').trim();

  if (cleanDescription.length <= 190) {
    return cleanDescription;
  }

  return `${cleanDescription.slice(0, 187).trim()}...`;
}

function getWateringInterval(watering: unknown) {
  if (typeof watering === 'string') {
    const value = watering.toLowerCase();

    if (value.includes('frequent') || value.includes('high')) {
      return 3;
    }

    if (value.includes('minimum') || value.includes('low')) {
      return 14;
    }
  }

  if (typeof watering === 'object' && watering !== null) {
    const maybeWatering = watering as { max?: number; min?: number };
    const values = [maybeWatering.min, maybeWatering.max].filter((value): value is number => typeof value === 'number');

    if (values.length) {
      return Math.max(1, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
    }
  }

  return defaultIntervalDays;
}
