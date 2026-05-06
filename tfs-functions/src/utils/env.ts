/**
 * Checks for and returns the value of the named environment variable.
 *
 * @param name - The name of the environment variable to read.
 * @throws {Error} If the environment variable is missing or empty.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * Checks for and returns the value of the named environment variable parsed as a positive integer.
 *
 * @param name - The name of the environment variable to read.
 * @throws {Error} If the environment variable is missing, empty, or not a positive integer.
 */
export function requireEnvInt(name: string): number {
  const value = requireEnv(name);
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) throw new Error(`Environment variable ${name} must be a positive integer, got: "${value}"`);
  return num;
}
