import { Platform } from 'react-native';

export type AuthUser = {
  id: number;
  email: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type RegisterResponse = {
  user: AuthUser;
  message: string;
};

export type PlantStatus = 'ok' | 'needs_watering';

export type Plant = {
  id: number;
  name: string;
  lastWatered: string;
  interval: number;
  imageUrl?: string | null;
  userId: number;
  nextWateringAt: string;
  status: PlantStatus;
};

type ApiErrorResponse = {
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  return typeof payload === 'object' && payload !== null && 'message' in payload;
}

const fallbackApiUrl = Platform.select({
  android: 'http://10.0.2.2:3000',
  default: 'http://localhost:3000',
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackApiUrl;

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiErrorResponse | T | null;

  if (!response.ok) {
    throw new ApiError(
      isApiErrorResponse(payload) && payload.message ? payload.message : 'Nie udalo sie polaczyc z API.',
      isApiErrorResponse(payload) ? payload.code : undefined,
    );
  }

  return payload as T;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseApiResponse<AuthResponse>(response);
}

export async function registerUser(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return parseApiResponse<RegisterResponse>(response);
}

export async function apiFetch(path: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  headers.set('Authorization', `Bearer ${token}`);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
}

export async function getPlants(token: string) {
  const response = await apiFetch('/plants', token);

  return parseApiResponse<Plant[]>(response);
}

export async function createPlant(token: string, name: string, interval: number, imageUrl?: string | null) {
  const response = await apiFetch('/plants', token, {
    method: 'POST',
    body: JSON.stringify({ name, interval, imageUrl }),
  });

  return parseApiResponse<Plant>(response);
}

export async function updatePlant(
  token: string,
  plantId: number,
  name: string,
  interval: number,
  imageUrl?: string | null,
) {
  const response = await apiFetch(`/plants/${plantId}`, token, {
    method: 'PUT',
    body: JSON.stringify({ name, interval, imageUrl }),
  });

  return parseApiResponse<Plant>(response);
}

export async function updatePlantPhoto(token: string, plantId: number, imageUrl?: string | null) {
  const response = await apiFetch(`/plants/${plantId}/photo`, token, {
    method: 'PATCH',
    body: JSON.stringify({ imageUrl }),
  });

  return parseApiResponse<Plant>(response);
}

export async function waterPlant(token: string, plantId: number) {
  const response = await apiFetch(`/plants/${plantId}/water`, token, {
    method: 'PATCH',
  });

  return parseApiResponse<Plant>(response);
}

export async function deletePlant(token: string, plantId: number) {
  const response = await apiFetch(`/plants/${plantId}`, token, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await parseApiResponse(response);
  }
}
