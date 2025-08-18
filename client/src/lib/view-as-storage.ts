// Local storage-based view context management as backup for session issues

interface ViewAsContext {
  originalUserId: string;
  viewAsType: string;
  viewAsUserId?: string;
  viewAsOrganizationId?: string;
  timestamp: string;
}

const STORAGE_KEY = 'kingdomops_view_as_context';

export const viewAsStorage = {
  // Store view context locally
  setViewContext(context: ViewAsContext) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    } catch (error) {
      console.warn('Failed to store view context locally:', error);
    }
  },

  // Get view context from local storage
  getViewContext(): ViewAsContext | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if context is older than 24 hours
        const timestamp = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          // Context expired, clear it
          this.clearViewContext();
          return null;
        }
        
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to retrieve view context from storage:', error);
    }
    return null;
  },

  // Clear view context
  clearViewContext() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear view context from storage:', error);
    }
  },

  // Check if currently in view as mode
  isViewingAs(): boolean {
    return this.getViewContext() !== null;
  }
};