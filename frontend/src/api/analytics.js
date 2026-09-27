import api from './client';

const buildQuery = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

/**
 * Analytics API Service
 */
export const analyticsApi = {
  /**
   * Get analytics summary (averages, distribution, consistency, period averages)
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  async getSummary(startDate, endDate) {
    return api.get(`/api/analytics/summary${buildQuery(startDate, endDate)}`);
  },

  /**
   * Get mood trends
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  async getMoodTrends(startDate, endDate) {
    return api.get(`/api/analytics/mood-trends${buildQuery(startDate, endDate)}`);
  },

  /**
   * Get stress trends
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  async getStressTrends(startDate, endDate) {
    return api.get(`/api/analytics/stress-trends${buildQuery(startDate, endDate)}`);
  },

  /**
   * Get calendar heatmap points
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  async getCalendar(startDate, endDate) {
    return api.get(`/api/analytics/calendar${buildQuery(startDate, endDate)}`);
  },

  /**
   * Get variable correlations
   * @param {string} [startDate]
   * @param {string} [endDate]
   */
  async getCorrelations(startDate, endDate) {
    return api.get(`/api/analytics/correlations${buildQuery(startDate, endDate)}`);
  },
};

export default analyticsApi;
