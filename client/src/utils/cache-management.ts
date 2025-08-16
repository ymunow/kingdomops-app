/**
 * Cache management utilities to prevent stale cache issues
 */

// Cache version for forcing cache invalidation
const CACHE_VERSION = "v1.0.0";
const VERSION_KEY = "app_cache_version";

/**
 * Check if cache needs to be cleared due to version mismatch
 */
export function checkCacheVersion(): boolean {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CACHE_VERSION) {
      clearStaleCache();
      localStorage.setItem(VERSION_KEY, CACHE_VERSION);
      return true; // Cache was cleared
    }
    return false; // Cache is current
  } catch (error) {
    console.warn("Cache version check failed:", error);
    return false;
  }
}

/**
 * Clear stale cache data
 */
function clearStaleCache(): void {
  try {
    // Clear localStorage items (except user preferences)
    const keysToKeep = ["user_preferences", "theme_preference"];
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear session storage
    sessionStorage.clear();
    
    console.info("Cache cleared due to version update");
    
  } catch (error) {
    console.warn("Failed to clear stale cache:", error);
  }
}

/**
 * Force cache refresh by adding timestamp to URLs
 */
export function getCacheBustedUrl(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${Date.now()}`;
}

/**
 * Set proper cache headers for different content types
 */
export function setCacheHeaders(response: Response, contentType: string): void {
  try {
    // Different caching strategies based on content type
    switch (contentType) {
      case 'html':
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        break;
        
      case 'api':
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        response.headers.set('Pragma', 'no-cache');
        break;
        
      case 'static':
        response.headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        break;
        
      case 'images':
        response.headers.set('Cache-Control', 'public, max-age=86400'); // 1 day
        break;
        
      default:
        response.headers.set('Cache-Control', 'no-cache');
    }
  } catch (error) {
    console.warn("Failed to set cache headers:", error);
  }
}

/**
 * Initialize cache management on app startup
 */
export function initializeCacheManagement(): void {
  // Check cache version on startup
  const cacheCleared = checkCacheVersion();
  
  if (cacheCleared) {
    // Optionally show user notification about cache update
    console.info("Application updated - cache refreshed");
  }
  
  // Set up periodic cache cleanup (every 24 hours)
  setInterval(() => {
    cleanupExpiredCache();
  }, 24 * 60 * 60 * 1000);
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('spiritual_gifts_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.expires && now > parsed.expires) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // If we can't parse it, it's probably corrupted - remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.info(`Cleaned up ${keysToRemove.length} expired cache entries`);
    }
    
  } catch (error) {
    console.warn("Cache cleanup failed:", error);
  }
}

/**
 * Emergency cache clear (for support/debugging)
 */
export function emergencyCacheClear(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Also try to clear service worker cache if available
    if ('serviceWorker' in navigator && 'caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).catch(error => {
        console.warn("Failed to clear service worker caches:", error);
      });
    }
    
    console.info("Emergency cache clear completed");
    
    // Recommend page reload
    if (confirm("Cache cleared. Reload page to ensure fresh content?")) {
      window.location.reload();
    }
    
  } catch (error) {
    console.error("Emergency cache clear failed:", error);
  }
}