import api from './client';

/**
 * Notifications API Service
 */
export const notificationsApi = {
  /**
   * Get notification preferences
   */
  async getPreferences() {
    return api.get('/api/notifications/preferences');
  },

  /**
   * Update notification preferences
   * @param {{ enabled?: boolean, reminder_time?: string, timezone?: string }} data
   */
  async updatePreferences(data) {
    return api.patch('/api/notifications/preferences', data);
  },
};

export default notificationsApi;
