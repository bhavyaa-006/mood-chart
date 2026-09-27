import api from './client';

/**
 * AI Insights API Service
 */
export const aiInsightsApi = {
  /**
   * Request generation of a new wellness insight
   * @param {{ days?: number, insight_type?: string }} [data]
   */
  async generateInsight(data = {}) {
    return api.post('/api/ai-insights/generate', {
      days: data.days || 14,
      insight_type: data.insight_type || 'mood_summary',
    });
  },

  /**
   * List paginated user insights
   * @param {number} [limit=20]
   * @param {number} [offset=0]
   */
  async listInsights(limit = 20, offset = 0) {
    return api.get(`/api/ai-insights?limit=${limit}&offset=${offset}`);
  },

  /**
   * Get single insight by ID
   * @param {string} insightId
   */
  async getInsight(insightId) {
    return api.get(`/api/ai-insights/${insightId}`);
  },

  /**
   * Delete an insight
   * @param {string} insightId
   */
  async deleteInsight(insightId) {
    return api.delete(`/api/ai-insights/${insightId}`);
  },
};

export default aiInsightsApi;
