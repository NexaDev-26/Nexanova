/**
 * Simple in-memory cache middleware for API responses
 * Provides caching with TTL (Time To Live) and per-user cache keys
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Generate cache key from request
   */
  generateKey(req, prefix = '') {
    const userId = req.userId || 'anonymous';
    const path = req.path;
    const query = JSON.stringify(req.query);
    return `${prefix}:${userId}:${path}:${query}`;
  }

  /**
   * Get cached value
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set cached value
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete cached value
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache for a user
   */
  clearUserCache(userId) {
    const keysToDelete = [];
    for (const [key] of this.cache) {
      if (key.includes(`:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const [key, item] of this.cache) {
      if (Date.now() > item.expiresAt) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }

  /**
   * Clean expired entries (should be called periodically)
   */
  cleanExpired() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }
}

// Create singleton instance
const cache = new Cache();

// Clean expired entries every 10 minutes
setInterval(() => {
  const cleaned = cache.cleanExpired();
  if (cleaned > 0 && process.env.NODE_ENV === 'development') {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}, 10 * 60 * 1000);

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds (default: 5 minutes)
 * @param {string} options.prefix - Cache key prefix
 * @param {Function} options.keyGenerator - Custom key generator function
 * @param {boolean} options.skipCache - Function to determine if cache should be skipped
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    prefix = 'api',
    keyGenerator,
    skipCache
  } = options;

  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if cache should be skipped
    if (skipCache && skipCache(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : cache.generateKey(req, prefix);

    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾 Cache HIT: ${cacheKey}`);
      }
      return res.json(cached);
    }

    // Cache miss - store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200 && data.success !== false) {
        cache.set(cacheKey, data, ttl);
        if (process.env.NODE_ENV === 'development') {
          console.log(`💾 Cache MISS: ${cacheKey} (cached for ${ttl / 1000}s)`);
        }
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Helper to invalidate user cache
 */
const invalidateUserCache = (userId) => {
  cache.clearUserCache(userId);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️ Invalidated cache for user ${userId}`);
  }
};

module.exports = {
  cache,
  cacheMiddleware,
  invalidateUserCache
};


