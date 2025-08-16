/**
 * Resilient localStorage utilities with comprehensive error handling
 */

export interface StorageOptions {
  prefix?: string;
  compress?: boolean;
  encrypt?: boolean;
  maxAge?: number; // in milliseconds
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expires?: number;
  version: string;
}

const DEFAULT_PREFIX = 'spiritual_gifts_';
const STORAGE_VERSION = '1.0';

/**
 * Check if localStorage is available and functional
 */
function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely stringify data with error handling
 */
function safeStringify(data: any): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to stringify data:', error);
    return null;
  }
}

/**
 * Safely parse data with error handling
 */
function safeParse<T = any>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error('Failed to parse data:', error);
    return null;
  }
}

/**
 * Create storage key with prefix
 */
function createKey(key: string, prefix: string = DEFAULT_PREFIX): string {
  return `${prefix}${key}`;
}

/**
 * Check if stored item has expired
 */
function isExpired(item: StorageItem): boolean {
  if (!item.expires) return false;
  return Date.now() > item.expires;
}

/**
 * Resilient localStorage wrapper with automatic fallbacks
 */
export class SafeStorage {
  private fallbackStore = new Map<string, string>();
  private options: Required<StorageOptions>;

  constructor(options: StorageOptions = {}) {
    this.options = {
      prefix: options.prefix || DEFAULT_PREFIX,
      compress: options.compress || false,
      encrypt: options.encrypt || false,
      maxAge: options.maxAge || 0 // 0 = no expiration
    };
  }

  /**
   * Store data with automatic fallback to memory
   */
  setItem<T>(key: string, data: T, customMaxAge?: number): boolean {
    try {
      const storageKey = createKey(key, this.options.prefix);
      const expires = customMaxAge || this.options.maxAge;
      
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expires: expires > 0 ? Date.now() + expires : undefined,
        version: STORAGE_VERSION
      };

      const serialized = safeStringify(item);
      if (!serialized) {
        console.warn(`Failed to serialize data for key: ${key}`);
        return false;
      }

      // Try localStorage first
      if (isStorageAvailable()) {
        try {
          localStorage.setItem(storageKey, serialized);
          return true;
        } catch (error) {
          console.warn(`localStorage failed for key ${key}, falling back to memory:`, error);
        }
      }

      // Fallback to memory storage
      this.fallbackStore.set(storageKey, serialized);
      return true;

    } catch (error) {
      console.error(`Failed to store data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve data with automatic fallback and expiration check
   */
  getItem<T>(key: string): T | null {
    try {
      const storageKey = createKey(key, this.options.prefix);
      let serialized: string | null = null;

      // Try localStorage first
      if (isStorageAvailable()) {
        try {
          serialized = localStorage.getItem(storageKey);
        } catch (error) {
          console.warn(`localStorage read failed for key ${key}:`, error);
        }
      }

      // Fallback to memory storage
      if (!serialized) {
        serialized = this.fallbackStore.get(storageKey) || null;
      }

      if (!serialized) {
        return null;
      }

      const item = safeParse<StorageItem<T>>(serialized);
      if (!item) {
        this.removeItem(key); // Clean up corrupted data
        return null;
      }

      // Check version compatibility
      if (item.version !== STORAGE_VERSION) {
        console.info(`Storage version mismatch for key ${key}, removing old data`);
        this.removeItem(key);
        return null;
      }

      // Check expiration
      if (isExpired(item)) {
        console.info(`Data expired for key ${key}, removing`);
        this.removeItem(key);
        return null;
      }

      return item.data;

    } catch (error) {
      console.error(`Failed to retrieve data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove data from both localStorage and fallback
   */
  removeItem(key: string): boolean {
    try {
      const storageKey = createKey(key, this.options.prefix);
      
      // Remove from localStorage
      if (isStorageAvailable()) {
        try {
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.warn(`Failed to remove from localStorage for key ${key}:`, error);
        }
      }

      // Remove from fallback
      this.fallbackStore.delete(storageKey);
      return true;

    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all data with matching prefix
   */
  clear(): boolean {
    try {
      const prefix = this.options.prefix;

      // Clear localStorage
      if (isStorageAvailable()) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }

      // Clear fallback
      const keysToDelete: string[] = [];
      this.fallbackStore.forEach((_, key) => {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.fallbackStore.delete(key));

      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  getStats(): { localStorageSize: number; fallbackSize: number; itemCount: number } {
    const prefix = this.options.prefix;
    let localStorageSize = 0;
    let itemCount = 0;
    
    // Count localStorage items
    if (isStorageAvailable()) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            const value = localStorage.getItem(key);
            if (value) {
              localStorageSize += new Blob([value]).size;
              itemCount++;
            }
          }
        }
      } catch (error) {
        console.warn('Failed to calculate localStorage stats:', error);
      }
    }

    // Count fallback storage
    let fallbackSize = 0;
    this.fallbackStore.forEach((value, key) => {
      if (key.startsWith(prefix)) {
        fallbackSize += new Blob([value]).size;
        if (localStorageSize === 0) itemCount++; // Only count if not already counted in localStorage
      }
    });

    return { localStorageSize, fallbackSize, itemCount };
  }
}

// Default instance for easy use
export const storage = new SafeStorage();

// Convenience functions for common operations
export const setStorageItem = <T>(key: string, data: T): boolean => storage.setItem(key, data);
export const getStorageItem = <T>(key: string): T | null => storage.getItem<T>(key);
export const removeStorageItem = (key: string): boolean => storage.removeItem(key);
export const clearStorage = (): boolean => storage.clear();

// Assessment-specific storage helpers
export const saveAssessmentProgress = (progress: any): boolean => {
  return setStorageItem('assessment_progress', progress);
};

export const getAssessmentProgress = (): any | null => {
  return getStorageItem('assessment_progress');
};

export const clearAssessmentProgress = (): boolean => {
  return removeStorageItem('assessment_progress');
};