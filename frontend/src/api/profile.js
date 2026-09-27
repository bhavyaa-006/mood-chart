import api from './client';

export const PRACTICE_CATEGORIES = [
  { id: 'stress_management', label: 'Stress Management', description: 'Techniques to de-escalate tension and build resilience' },
  { id: 'relaxation', label: 'Relaxation & Calm', description: 'Unwinding mind and body after demanding situations' },
  { id: 'focus', label: 'Focus & Concentration', description: 'Sharpening attention and sustaining productive flow' },
  { id: 'mindfulness', label: 'Mindfulness & Awareness', description: 'Present-moment grounding and sensory observation' },
  { id: 'breathing', label: 'Breathing Exercises', description: 'Paced breathwork for somatic calming and nervous system balance' },
  { id: 'emotional_awareness', label: 'Emotional Awareness', description: 'Recognizing, naming, and navigating complex feelings' },
  { id: 'sleep_habits', label: 'Sleep Habits', description: 'Promoting restful night routines and evening calmness' },
  { id: 'self_reflection', label: 'Self-Reflection', description: 'Introspective writing and examining personal growth' },
  { id: 'cognitive_exercises', label: 'Cognitive Exercises', description: 'Light mental drills to maintain cognitive flexibility' },
];

/**
 * Profile & Goals API Service
 */
export const profileApi = {
  /**
   * Get user profile and goals
   */
  async getProfile() {
    return api.get('/api/profile');
  },

  /**
   * Update profile display name and timezone
   * @param {{ display_name?: string, timezone?: string }} data
   */
  async updateProfile(data) {
    return api.patch('/api/profile', data);
  },

  /**
   * Complete onboarding flow
   * @param {{ display_name?: string, timezone?: string, goals: string[] }} data
   */
  async completeOnboarding(data) {
    return api.post('/api/profile/onboarding', data);
  },

  /**
   * List user's selected practice goals
   */
  async listGoals() {
    return api.get('/api/profile/goals');
  },

  /**
   * Add a practice goal
   * @param {string} category
   */
  async addGoal(category) {
    return api.post('/api/profile/goals', { category });
  },

  /**
   * Remove a practice goal
   * @param {string} goalId
   */
  async deleteGoal(goalId) {
    return api.delete(`/api/profile/goals/${goalId}`);
  },
};

export default profileApi;
