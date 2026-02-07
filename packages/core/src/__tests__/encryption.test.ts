import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encrypt, decrypt } from '../security/encryption';

describe('Encryption Utilities', () => {
  const testData = {
    name: 'John Doe',
    email: 'john@example.com',
    ssn: '123-45-6789',
    sensitive: 'This is very sensitive data',
  };

  const encryptionKey = 'test-key-for-unit-tests-only';

  describe('encrypt', () => {
    it('should encrypt data and return encrypted content with IV', () => {
      const result = encrypt(testData.sensitive, encryptionKey);
      
      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result.encrypted).not.toBe(testData.sensitive);
      expect(result.iv).toBeDefined();
      expect(result.iv.length).toBeGreaterThan(0);
    });

    it('should produce different ciphertext for same input (due to random IV)', () => {
      const result1 = encrypt(testData.sensitive, encryptionKey);
      const result2 = encrypt(testData.sensitive, encryptionKey);
      
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });
  });

  describe('decrypt', () => {
    it('should decrypt data back to original value', () => {
      const encrypted = encrypt(testData.sensitive, encryptionKey);
      const decrypted = decrypt(encrypted, encryptionKey);
      
      expect(decrypted).toBe(testData.sensitive);
    });

    it('should handle empty strings', () => {
      const encrypted = encrypt('', encryptionKey);
      const decrypted = decrypt(encrypted, encryptionKey);
      
      expect(decrypted).toBe('');
    });

    it('should handle long strings', () => {
      const longString = 'x'.repeat(10000);
      const encrypted = encrypt(longString, encryptionKey);
      const decrypted = decrypt(encrypted, encryptionKey);
      
      expect(decrypted).toBe(longString);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~\n\t';
      const encrypted = encrypt(specialChars, encryptionKey);
      const decrypted = decrypt(encrypted, encryptionKey);
      
      expect(decrypted).toBe(specialChars);
    });

    it('should handle unicode characters', () => {
      const unicode = '你好世界 🌍 مرحبا بالعالم';
      const encrypted = encrypt(unicode, encryptionKey);
      const decrypted = decrypt(encrypted, encryptionKey);
      
      expect(decrypted).toBe(unicode);
    });
  });

  describe('encryption with different keys', () => {
    it('should fail to decrypt with wrong key', () => {
      const encrypted = encrypt(testData.sensitive, encryptionKey);
      const wrongKey = 'wrong-key';
      
      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });
  });
});
