/**
 * Centralized API Client with JWT Bearer Token Management,
 * Automatic Token Refresh on 401, and Structured Error Normalization.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const TOKEN_KEY = 'mood_cockpit_access_token';
const REFRESH_TOKEN_KEY = 'mood_cockpit_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Queue for handling simultaneous requests while token refresh is in flight
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Standardized API Error Class
 */
export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Normalizes FastAPI/Pydantic error responses
 */
const formatErrorDetail = (detail) => {
  if (!detail) return 'An unexpected error occurred';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // Pydantic validation error array: [{ loc: ['body', 'field'], msg: '...' }]
    return detail.map((err) => `${err.loc?.slice(1).join('.') || 'field'}: ${err.msg}`).join(', ');
  }
  if (typeof detail === 'object') {
    return JSON.stringify(detail);
  }
  return String(detail);
};

/**
 * Core HTTP Request Function
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Add auth header if token exists and not explicitly skipped
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Handle JSON vs Form Data
  if (options.body && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    // 401 Unauthorized handling (token expiration)
    if (
      response.status === 401 &&
      !endpoint.includes('/api/auth/login') &&
      !endpoint.includes('/api/auth/refresh') &&
      !endpoint.includes('/api/auth/register')
    ) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw new ApiError('Session expired. Please log in again.', 401);
      }

      if (isRefreshing) {
        // Queue this request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            config.headers.set('Authorization', `Bearer ${newToken}`);
            return apiRequest(endpoint, config);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshResponse.ok) {
          clearTokens();
          processQueue(new ApiError('Session expired. Please log in again.', 401), null);
          window.dispatchEvent(new CustomEvent('auth:expired'));
          throw new ApiError('Session expired. Please log in again.', 401);
        }

        const tokens = await refreshResponse.json();
        setTokens(tokens.access_token, tokens.refresh_token);
        processQueue(null, tokens.access_token);

        // Retry original request
        config.headers.set('Authorization', `Bearer ${tokens.access_token}`);
        return apiRequest(endpoint, config);
      } catch (refreshErr) {
        clearTokens();
        processQueue(refreshErr, null);
        window.dispatchEvent(new CustomEvent('auth:expired'));
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    // Check for other error statuses
    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        // Response was not JSON
      }

      const errorMessage = errorData
        ? formatErrorDetail(errorData.detail)
        : `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, errorData?.detail);
    }

    // Parse JSON response if present
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or client-side fetch error
    throw new ApiError(
      error.message || 'Unable to connect to server. Please check your network.',
      0
    );
  }
}

export default {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body }),
  patch: (endpoint, body, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};
