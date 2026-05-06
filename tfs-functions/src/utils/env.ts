export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function requireEnvInt(name: string): number {
  const value = requireEnv(name);
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) throw new Error(`Environment variable ${name} must be a positive integer, got: "${value}"`);
  return num;
}
