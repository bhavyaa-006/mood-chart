import api from './client';

/**
 * Journal API Service
 */
export const journalApi = {
  /**
   * List user's journal entries (sorted desc by entry_date)
   */
  async listJournal() {
    return api.get('/api/journal');
  },

  /**
   * Get single journal entry
   * @param {string} entryId
   */
  async getJournal(entryId) {
    return api.get(`/api/journal/${entryId}`);
  },

  /**
   * Create journal entry
   * @param {{ content: string, entry_date: string }} data
   */
  async createJournal(data) {
    return api.post('/api/journal', data);
  },

  /**
   * Update existing journal entry
   * @param {string} entryId
   * @param {{ content?: string, entry_date?: string }} data
   */
  async updateJournal(entryId, data) {
    return api.patch(`/api/journal/${entryId}`, data);
  },

  /**
   * Delete journal entry
   * @param {string} entryId
   */
  async deleteJournal(entryId) {
    return api.delete(`/api/journal/${entryId}`);
  },
};

export default journalApi;
