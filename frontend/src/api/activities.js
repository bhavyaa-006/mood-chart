import api from './client';

/**
 * Activities & Sessions API Service
 */
export const activitiesApi = {
  /**
   * List all available activities
   */
  async listActivities() {
    return api.get('/api/activities');
  },

  /**
   * Get single activity detail
   * @param {string} activityId
   */
  async getActivity(activityId) {
    return api.get(`/api/activities/${activityId}`);
  },

  /**
   * Start an activity session
   * @param {string} activityId
   * @param {{ started_at?: string, score?: number, metadata?: object }} [data]
   */
  async startSession(activityId, data = {}) {
    return api.post(`/api/activities/${activityId}/sessions`, data);
  },

  /**
   * Complete an active session
   * @param {string} sessionId
   * @param {{ score?: number, metadata?: object }} data
   */
  async completeSession(sessionId, data = {}) {
    return api.post(`/api/activities/sessions/${sessionId}/complete`, data);
  },

  /**
   * List user's activity sessions
   */
  async listSessions() {
    return api.get('/api/activities/sessions');
  },
};

export default activitiesApi;
