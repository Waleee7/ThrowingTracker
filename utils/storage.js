// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

var storage = {
  get: function(key) {
    try {
      var item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  },
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage write error:', error);
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded.');
      }
      return false;
    }
  }
};
