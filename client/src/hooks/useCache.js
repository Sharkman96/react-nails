import { useState, useEffect, useCallback } from 'react';

class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
  }

  set(key, value, ttlMs = 5 * 60 * 1000) { // 5 минут по умолчанию
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expiry = this.ttl.get(key);
    if (Date.now() > expiry) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, expiry] of this.ttl.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }
}

// Глобальный экземпляр кэша
const globalCache = new Cache();

// Автоматическая очистка кэша каждые 5 минут
setInterval(() => {
  globalCache.cleanup();
}, 5 * 60 * 1000);

export const useCache = (key, fetcher, options = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 минут
    enabled = true,
    refetchOnWindowFocus = false,
    refetchOnReconnect = true
  } = options;

  const [data, setData] = useState(() => globalCache.get(key));
  const [loading, setLoading] = useState(!data && enabled);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Проверяем кэш, если не принудительная загрузка
    if (!force) {
      const cachedData = globalCache.get(key);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      globalCache.set(key, result, ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Cache fetch error for key "${key}":`, err);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch при фокусе окна
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      fetchData(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData]);

  // Refetch при восстановлении соединения
  useEffect(() => {
    if (!refetchOnReconnect) return;

    const handleOnline = () => {
      fetchData(true);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetchOnReconnect, fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate
  };
};

// Утилиты для работы с кэшем
export const cacheUtils = {
  get: (key) => globalCache.get(key),
  set: (key, value, ttl) => globalCache.set(key, value, ttl),
  delete: (key) => globalCache.delete(key),
  clear: () => globalCache.clear(),
  cleanup: () => globalCache.cleanup()
}; 