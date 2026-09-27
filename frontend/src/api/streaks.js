import api from './client';

/**
 * Streaks & XP API Service
 */
export const streaksApi = {
  /**
   * Get user's current streak, longest streak, total logs, and XP
   */
  async getStreaks() {
    return api.get('/api/streaks');
  },
};

export default streaksApi;
