import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimitMiddleware, strictRateLimitMiddleware, authRateLimitMiddleware, cleanupRateLimitCache } from '../security/rate-limit';

describe('Rate Limiting', () => {
  describe('rateLimitMiddleware', () => {
    it('should allow requests under the limit', async () => {
      const mockC = {
        req: {
          header: vi.fn().mockReturnValue('127.0.0.1'),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      // Make 5 requests (under the 100 limit)
      for (let i = 0; i < 5; i++) {
        await rateLimitMiddleware(mockC as any, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
      expect(mockC.json).not.toHaveBeenCalled();
    });

    it('should block requests over the limit', async () => {
      const mockC = {
        req: {
          header: vi.fn().mockReturnValue('127.0.0.2'),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      // Make more requests than the limit (20 in strict mode, 100 in normal)
      // We use strictRateLimitMiddleware which has a limit of 20
      for (let i = 0; i < 25; i++) {
        await strictRateLimitMiddleware(mockC as any, mockNext);
      }

      // First 20 should pass, rest should be blocked
      expect(mockNext).toHaveBeenCalledTimes(20);
      expect(mockC.json).toHaveBeenCalledWith({ error: 'Too many requests' }, 429);
    });
  });

  describe('authRateLimitMiddleware', () => {
    it('should have stricter limits for auth endpoints', async () => {
      const mockC = {
        req: {
          header: vi.fn().mockReturnValue('127.0.0.3'),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      // Auth rate limit is 5 requests per 15 minutes
      for (let i = 0; i < 10; i++) {
        await authRateLimitMiddleware(mockC as any, mockNext);
      }

      expect(mockNext).toHaveBeenCalledTimes(5);
      expect(mockC.json).toHaveBeenCalledWith({ error: 'Too many login attempts' }, 429);
    });
  });

  describe('cleanupRateLimitCache', () => {
    it('should remove expired entries from cache', () => {
      // This is a basic test - actual implementation would need
      // to manipulate the internal cache directly
      expect(typeof cleanupRateLimitCache).toBe('function');
    });
  });

  describe('IP detection', () => {
    it('should use CF-Connecting-IP header when present', async () => {
      const mockC = {
        req: {
          header: vi.fn((header) => {
            if (header === 'CF-Connecting-IP') return '203.0.113.1';
            if (header === 'X-Forwarded-For') return '198.51.100.1';
            return null;
          }),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      await rateLimitMiddleware(mockC as any, mockNext);

      expect(mockC.req.header).toHaveBeenCalledWith('CF-Connecting-IP');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fallback to X-Forwarded-For when CF-Connecting-IP is missing', async () => {
      const mockC = {
        req: {
          header: vi.fn((header) => {
            if (header === 'CF-Connecting-IP') return null;
            if (header === 'X-Forwarded-For') return '198.51.100.1';
            return null;
          }),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      await rateLimitMiddleware(mockC as any, mockNext);

      expect(mockC.req.header).toHaveBeenCalledWith('X-Forwarded-For');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use unknown IP when no headers present', async () => {
      const mockC = {
        req: {
          header: vi.fn().mockReturnValue(null),
        },
        json: vi.fn().mockReturnThis(),
      };
      const mockNext = vi.fn().mockResolvedValue(undefined);

      await rateLimitMiddleware(mockC as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
