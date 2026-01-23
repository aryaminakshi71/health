"""
Caching Layer for Performance Optimization
Handles Redis caching and in-memory caching for improved performance
"""

import json
import hashlib
from typing import Any, Optional, Union, Dict, List
from datetime import datetime, timedelta
import logging
from functools import wraps

logger = logging.getLogger(__name__)

class CacheManager:
    """Cache manager for handling both Redis and in-memory caching"""
    
    def __init__(self):
        self.redis_client = None
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection"""
        try:
            import redis
            self.redis_client = redis.Redis(
                host='localhost',
                port=6379,
                db=0,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Redis not available, using in-memory cache: {e}")
            self.redis_client = None
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from prefix and arguments"""
        key_parts = [prefix]
        
        # Add args
        if args:
            key_parts.extend([str(arg) for arg in args])
        
        # Add kwargs (sorted for consistency)
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_parts.extend([f"{k}:{v}" for k, v in sorted_kwargs])
        
        key_string = "|".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            # Try Redis first
            if self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
            
            # Fallback to memory cache
            if key in self.memory_cache:
                cache_entry = self.memory_cache[key]
                if cache_entry['expires_at'] > datetime.now():
                    return cache_entry['value']
                else:
                    # Remove expired entry
                    del self.memory_cache[key]
            
            return default
            
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        try:
            # Try Redis first
            if self.redis_client:
                self.redis_client.setex(key, ttl, json.dumps(value))
                return True
            
            # Fallback to memory cache
            expires_at = datetime.now() + timedelta(seconds=ttl)
            self.memory_cache[key] = {
                'value': value,
                'expires_at': expires_at
            }
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            # Try Redis first
            if self.redis_client:
                self.redis_client.delete(key)
            
            # Remove from memory cache
            if key in self.memory_cache:
                del self.memory_cache[key]
            
            return True
            
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    def clear(self, pattern: str = "*") -> bool:
        """Clear cache entries matching pattern"""
        try:
            # Try Redis first
            if self.redis_client:
                keys = self.redis_client.keys(pattern)
                if keys:
                    self.redis_client.delete(*keys)
            
            # Clear memory cache if pattern is "*"
            if pattern == "*":
                self.memory_cache.clear()
            else:
                # Remove matching keys from memory cache
                keys_to_remove = [k for k in self.memory_cache.keys() if pattern in k]
                for key in keys_to_remove:
                    del self.memory_cache[key]
            
            return True
            
        except Exception as e:
            logger.error(f"Cache clear error for pattern {pattern}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            # Try Redis first
            if self.redis_client:
                return bool(self.redis_client.exists(key))
            
            # Check memory cache
            if key in self.memory_cache:
                cache_entry = self.memory_cache[key]
                if cache_entry['expires_at'] > datetime.now():
                    return True
                else:
                    # Remove expired entry
                    del self.memory_cache[key]
            
            return False
            
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            stats = {
                'redis_connected': self.redis_client is not None,
                'memory_cache_size': len(self.memory_cache),
                'memory_cache_keys': list(self.memory_cache.keys())
            }
            
            if self.redis_client:
                try:
                    info = self.redis_client.info()
                    stats['redis_info'] = {
                        'used_memory': info.get('used_memory_human'),
                        'connected_clients': info.get('connected_clients'),
                        'total_commands_processed': info.get('total_commands_processed')
                    }
                except Exception as e:
                    stats['redis_info'] = {'error': str(e)}
            
            return stats
            
        except Exception as e:
            logger.error(f"Cache stats error: {e}")
            return {'error': str(e)}

# Global cache manager instance
cache_manager = CacheManager()

def cached(prefix: str, ttl: int = 3600):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache_manager._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func.__name__}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for {func.__name__}, cached result")
            
            return result
        return wrapper
    return decorator

def invalidate_cache(prefix: str):
    """Decorator for invalidating cache after function execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidate cache entries with matching prefix
            cache_manager.clear(f"{prefix}*")
            logger.debug(f"Invalidated cache for prefix: {prefix}")
            
            return result
        return wrapper
    return decorator

# Cache keys for different data types
class CacheKeys:
    """Predefined cache keys for different data types"""
    
    @staticmethod
    def user_profile(user_id: str) -> str:
        return f"user:profile:{user_id}"
    
    @staticmethod
    def client_data(client_id: str) -> str:
        return f"client:data:{client_id}"
    
    @staticmethod
    def analytics_data(time_range: str) -> str:
        return f"analytics:{time_range}"
    
    @staticmethod
    def communication_stats(date: str) -> str:
        return f"communication:stats:{date}"
    
    @staticmethod
    def system_status() -> str:
        return "system:status"
    
    @staticmethod
    def api_response(endpoint: str, params: str) -> str:
        return f"api:response:{endpoint}:{params}"

# Utility functions for common caching operations
def cache_user_profile(user_id: str, profile_data: Dict[str, Any], ttl: int = 1800):
    """Cache user profile data"""
    key = CacheKeys.user_profile(user_id)
    return cache_manager.set(key, profile_data, ttl)

def get_cached_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get cached user profile data"""
    key = CacheKeys.user_profile(user_id)
    return cache_manager.get(key)

def cache_client_data(client_id: str, client_data: Dict[str, Any], ttl: int = 3600):
    """Cache client data"""
    key = CacheKeys.client_data(client_id)
    return cache_manager.set(key, client_data, ttl)

def get_cached_client_data(client_id: str) -> Optional[Dict[str, Any]]:
    """Get cached client data"""
    key = CacheKeys.client_data(client_id)
    return cache_manager.get(key)

def cache_analytics_data(time_range: str, analytics_data: Dict[str, Any], ttl: int = 1800):
    """Cache analytics data"""
    key = CacheKeys.analytics_data(time_range)
    return cache_manager.set(key, analytics_data, ttl)

def get_cached_analytics_data(time_range: str) -> Optional[Dict[str, Any]]:
    """Get cached analytics data"""
    key = CacheKeys.analytics_data(time_range)
    return cache_manager.get(key)

def invalidate_user_cache(user_id: str):
    """Invalidate all cache entries for a user"""
    cache_manager.clear(f"user:*{user_id}*")

def invalidate_client_cache(client_id: str):
    """Invalidate all cache entries for a client"""
    cache_manager.clear(f"client:*{client_id}*")

def invalidate_analytics_cache():
    """Invalidate all analytics cache entries"""
    cache_manager.clear("analytics:*")

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    return cache_manager.get_stats()
