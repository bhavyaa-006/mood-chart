import api, { apiRequest } from './client';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register a new user
   * @param {{ email: string, password: string, full_name?: string }} data
   */
  async register({ email, password, full_name }) {
    return api.post('/api/auth/register', {
      email,
      password,
      ...(full_name ? { full_name } : {}),
    });
  },

  /**
   * Login with email and password using OAuth2 x-www-form-urlencoded
   * @param {{ email: string, password: string }} data
   */
  async login({ email, password }) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return apiRequest('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },

  /**
   * Refresh access token
   * @param {string} refreshToken
   */
  async refresh(refreshToken) {
    return api.post('/api/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * Logout user by revoking refresh token
   * @param {string} refreshToken
   */
  async logout(refreshToken) {
    return api.post('/api/auth/logout', { refresh_token: refreshToken });
  },

  /**
   * Request password reset instructions
   * @param {string} email
   */
  async forgotPassword(email) {
    return api.post('/api/auth/forgot-password', { email });
  },

  /**
   * Reset password with token
   * @param {{ token: string, password: string }} data
   */
  async resetPassword({ token, password }) {
    return api.post('/api/auth/reset-password', { token, password });
  },

  /**
   * Get current authenticated user details
   */
  async getMe() {
    return api.get('/api/auth/me');
  },
};

export default authApi;
