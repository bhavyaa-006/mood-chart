import api from './client';

/**
 * Mood Tracking API Service
 */
export const moodApi = {
  /**
   * List user's mood entries (sorted desc by entry_date)
   */
  async listMoods() {
    return api.get('/api/moods');
  },

  /**
   * Get single mood entry
   * @param {string} moodId
   */
  async getMood(moodId) {
    return api.get(`/api/moods/${moodId}`);
  },

  /**
   * Create daily mood entry
   * @param {{ mood: number, stress_level: number, energy_level: number, entry_date: string, notes?: string }} data
   */
  async createMood(data) {
    return api.post('/api/moods', data);
  },

  /**
   * Update existing mood entry
   * @param {string} moodId
   * @param {{ mood?: number, stress_level?: number, energy_level?: number, entry_date?: string, notes?: string }} data
   */
  async updateMood(moodId, data) {
    return api.patch(`/api/moods/${moodId}`, data);
  },

  /**
   * Delete mood entry
   * @param {string} moodId
   */
  async deleteMood(moodId) {
    return api.delete(`/api/moods/${moodId}`);
  },
};

export default moodApi;
