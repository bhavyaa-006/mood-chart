import api from './client';

/**
 * Achievements API Service
 */
export const achievementsApi = {
  /**
   * List all achievements with unlock status
   */
  async listAchievements() {
    return api.get('/api/achievements');
  },

  /**
   * List only unlocked achievements
   */
  async listUnlocked() {
    return api.get('/api/achievements/unlocked');
  },
};

export default achievementsApi;
