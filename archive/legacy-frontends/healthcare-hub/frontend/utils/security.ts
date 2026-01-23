import crypto from 'crypto';

export class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  encrypt(data: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateToken(token: string): boolean {
    return token.length === 64 && /^[a-f0-9]+$/i.test(token);
  }
}

export const securityManager = SecurityManager.getInstance();
