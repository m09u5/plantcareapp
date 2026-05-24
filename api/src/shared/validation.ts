export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 8;
}

export function isValidPlantName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length >= 2;
}

export function isValidInterval(interval: unknown): interval is number {
  return typeof interval === 'number' && Number.isInteger(interval) && interval > 0 && interval <= 365;
}
