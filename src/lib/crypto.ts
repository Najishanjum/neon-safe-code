// Client-side end-to-end encryption helpers.
// Credentials are encrypted in the browser with AES-GCM using a key derived
// from the user's master passphrase (PBKDF2-SHA256). The passphrase and the
// derived key never leave the device — the database only ever sees ciphertext.

const PREFIX = 'v1';
const PBKDF2_ITERATIONS = 310_000;
const VERIFIER_PLAINTEXT = 'vault-unlocked';

const enc = new TextEncoder();
const dec = new TextDecoder();

export const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const generateSalt = (): string => toBase64(crypto.getRandomValues(new Uint8Array(16)));

export const deriveKey = async (passphrase: string, saltB64: string): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltB64),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const isEncrypted = (value: string | null | undefined): boolean =>
  typeof value === 'string' && value.startsWith(`${PREFIX}.`);

export const encryptString = async (key: CryptoKey, plaintext: string): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  return `${PREFIX}.${toBase64(iv)}.${toBase64(new Uint8Array(ciphertext))}`;
};

export const decryptString = async (key: CryptoKey, payload: string): Promise<string> => {
  // Values stored before encryption was enabled are returned as-is.
  if (!isEncrypted(payload)) return payload;

  const [, ivB64, dataB64] = payload.split('.');
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(ivB64) },
      key,
      fromBase64(dataB64)
    );
    return dec.decode(plaintext);
  } catch {
    return '••••••••';
  }
};

/** Creates the value stored in the database to check a passphrase is correct. */
export const createVerifier = (key: CryptoKey): Promise<string> =>
  encryptString(key, VERIFIER_PLAINTEXT);

export const checkVerifier = async (key: CryptoKey, verifier: string): Promise<boolean> => {
  try {
    const [, ivB64, dataB64] = verifier.split('.');
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(ivB64) },
      key,
      fromBase64(dataB64)
    );
    return dec.decode(plaintext) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
};
