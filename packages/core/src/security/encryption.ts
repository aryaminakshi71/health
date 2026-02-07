import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt: string;
}

export function encrypt(plaintext: string, password: string): EncryptedData {
  const salt = randomBytes(SALT_LENGTH);
  const key = getKey(password, salt);
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    salt: salt.toString('hex'),
  };
}

export function decrypt(data: EncryptedData, password: string): string {
  const salt = Buffer.from(data.salt, 'hex');
  const key = getKey(password, salt);
  const iv = Buffer.from(data.iv, 'hex');
  const tag = Buffer.from(data.tag, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  password: string
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string, password).encrypted as T[keyof T];
    }
  }
  
  return result;
}

export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  password: string
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (typeof result[field] === 'string' && result[field]) {
      try {
        const encryptedData: EncryptedData = {
          encrypted: result[field] as string,
          iv: '',
          tag: '',
          salt: '',
        };
        result[field] = decrypt(encryptedData, password) as T[keyof T];
      } catch {
      }
    }
  }
  
  return result;
}

export function hashSensitiveData(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

import { createHash } from 'crypto';
