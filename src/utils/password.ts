import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Generates a random salt to be used for password hashing.
 *
 * @returns {string} A hexadecimal string representing the generated salt.
 */
function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Generates a hashed password using the PBKDF2 algorithm with the provided password and salt.
 *
 * @param {string} password - The plain text password to be hashed.
 * @param {string} salt - The salt to be used in the hashing process.
 * @returns {string} The hashed password as a hexadecimal string.
 */
function generateHash(password: string, salt: string): string {
  // Normalize the supplied password to avoid encoding inconsistencies
  const normalizedPassword = password.normalize();
  return pbkdf2Sync(normalizedPassword, salt, 100000, 64, 'sha512').toString(
    'hex',
  );
}

/**
 * Hashes a password and returns a string in the format `salt:hash`.
 *
 * @param {string} password - The plain text password to hash.
 * @returns {string} The concatenated salt and hash, separated by a colon.
 */
export function hashPassword(password: string): string {
  const salt = generateSalt();
  const hash = generateHash(password, salt);
  return `${salt}:${hash}`;
}

/**
 * Compares a stored hashed password with a supplied password by hashing the supplied password
 * with the same salt used to generate the stored hash.
 *
 * @param {string} storedPassword - The stored password in the format `salt:hash`.
 * @param {string} suppliedPassword - The plain text password to compare.
 * @returns {boolean} True if the passwords match, false otherwise.
 */
export function comparePassword(
  storedPassword: string,
  suppliedPassword: string,
): boolean {
  const [storedSalt, storedHash] = storedPassword.split(':');

  // Generate the hash using the stored salt
  const hash = generateHash(suppliedPassword, storedSalt);

  // Use timing-safe comparison to prevent timing attacks
  try {
    const comparison = timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(storedHash),
    );

    return comparison;
  } catch (error) {
    // Return false in case of an error (e.g., mismatched buffer lengths)
    return false;
  }
}
