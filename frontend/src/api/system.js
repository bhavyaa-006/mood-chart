import api from './client';

/**
 * System Health & Readiness API Service
 */
export const systemApi = {
  /**
   * Health probe
   */
  async getHealth() {
    return api.get('/health');
  },

  /**
   * Readiness probe
   */
  async getReady() {
    return api.get('/ready');
  },
};

export default systemApi;
