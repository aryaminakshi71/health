import { eq } from 'drizzle-orm';
import { db } from '@healthcare-saas/storage';
import { users, mfaSecrets } from '@healthcare-saas/storage/db/schema';
import { encrypt, decrypt } from '../security/encryption';

const TOTP_ISSUER = 'HealthcareApp';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;

export interface MFAConfig {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}

export interface TOTPResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function generateTOTPSecret(): { secret: string; qrCode: string } {
  const secret = generateRandomBase32(20);
  const qrCode = generateQRCodeUrl('healthcare-user@example.com', secret);

  return { secret, qrCode };
}

function generateRandomBase32(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

function generateQRCodeUrl(account: string, secret: string): string {
  const label = encodeURIComponent(account);
  const issuer = encodeURIComponent(TOTP_ISSUER);
  return `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

export function verifyTOTP(token: string, secret: string): boolean {
  const window = 1;
  const timeSteps = getTimeSteps(window);

  for (const timeStep of timeSteps) {
    if (generateTOTP(secret, timeStep) === token) {
      return true;
    }
  }

  return false;
}

function generateTOTP(secret: string, timeStep: number): string {
  const epoch = Math.floor(timeStep / TOTP_PERIOD);
  return generateHOTP(secret, epoch);
}

function generateHOTP(secret: string, counter: number): string {
  const secretBytes = base32ToBuffer(secret);
  const counterBytes = new Uint8Array(8);
  
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter >>>= 8;
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha1', secretBytes);
  hmac.update(counterBytes);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0x0f;
  const code = ((hash[offset] & 0x7f) << 24) |
               ((hash[offset + 1] & 0xff) << 16) |
               ((hash[offset + 2] & 0xff) << 8) |
               (hash[offset + 3] & 0xff);

  return String(code % Math.pow(10, TOTP_DIGITS)).padStart(TOTP_DIGITS, '0');
}

function base32ToBuffer(base32: string): Buffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let buffer: number[] = [];

  for (let i = 0; i < base32.length; i++) {
    const val = chars.indexOf(base32[i].toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    buffer.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(buffer);
}

function getTimeSteps(window: number): number[] {
  const now = Date.now();
  const currentStep = Math.floor(now / 1000 / TOTP_PERIOD);
  const steps: number[] = [];

  for (let i = -window; i <= window; i++) {
    steps.push((currentStep + i) * TOTP_PERIOD * 1000);
  }

  return steps;
}

export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = generateRandomBase32(8);
    codes.push(code.match(/.{1,4}/g)!.join('-').toUpperCase());
  }
  return codes;
}

export async function enableMFA(userId: string): Promise<TOTPResult> {
  const { secret, qrCode } = generateTOTPSecret();
  const backupCodes = generateBackupCodes();

  const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-me';

  await db.insert(mfaSecrets).values({
    userId,
    secret: encrypt(secret, encryptionKey).encrypted,
    backupCodes: encrypt(JSON.stringify(backupCodes), encryptionKey).encrypted,
    enabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: mfaSecrets.userId,
    set: {
      secret: encrypt(secret, encryptionKey).encrypted,
      backupCodes: encrypt(JSON.stringify(backupCodes), encryptionKey).encrypted,
      enabled: false,
      updatedAt: new Date(),
    },
  });

  return { secret, qrCode, backupCodes };
}

export async function verifyAndEnableMFA(userId: string, token: string): Promise<boolean> {
  const secretRecord = await db.query.mfaSecrets.findFirst({
    where: eq(mfaSecrets.userId, userId),
  });

  if (!secretRecord?.secret) {
    return false;
  }

  const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-me';
  const decryptedSecret = decrypt({ ...secretRecord, encrypted: secretRecord.secret } as any, encryptionKey);

  if (!verifyTOTP(token, decryptedSecret)) {
    return false;
  }

  await db.update(mfaSecrets)
    .set({ enabled: true, verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(mfaSecrets.userId, userId));

  return true;
}

export async function verifyMFA(userId: string, token: string): Promise<boolean> {
  const secretRecord = await db.query.mfaSecrets.findFirst({
    where: eq(mfaSecrets.userId, userId),
  });

  if (!secretRecord?.enabled || !secretRecord.secret) {
    return false;
  }

  const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-me';
  const decryptedSecret = decrypt({ ...secretRecord, encrypted: secretRecord.secret } as any, encryptionKey);

  if (verifyTOTP(token, decryptedSecret)) {
    return true;
  }

  if (secretRecord.backupCodes) {
    const decryptedCodes = JSON.parse(decrypt({ ...secretRecord, encrypted: secretRecord.backupCodes } as any, encryptionKey));
    const codeIndex = decryptedCodes.indexOf(token.toUpperCase().replace(/-/g, ''));

    if (codeIndex !== -1) {
      decryptedCodes.splice(codeIndex, 1);
      const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-key-change-me';
      await db.update(mfaSecrets)
        .set({ backupCodes: encrypt(JSON.stringify(decryptedCodes), encryptionKey).encrypted, updatedAt: new Date() })
        .where(eq(mfaSecrets.userId, userId));

      return true;
    }
  }

  return false;
}

export async function disableMFA(userId: string, token: string): Promise<boolean> {
  const verified = await verifyMFA(userId, token);

  if (verified) {
    await db.delete(mfaSecrets).where(eq(mfaSecrets.userId, userId));
    return true;
  }

  return false;
}

export async function getMFAStatus(userId: string): Promise<{ enabled: boolean; verified: boolean }> {
  const secretRecord = await db.query.mfaSecrets.findFirst({
    where: eq(mfaSecrets.userId, userId),
  });

  return {
    enabled: secretRecord?.enabled || false,
    verified: !!secretRecord?.verifiedAt,
  };
}
