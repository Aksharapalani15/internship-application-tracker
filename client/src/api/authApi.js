import { request } from './client';

export const authApi = {
  /**
   * Registers a new user account
   */
  async register({ name, email, password }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  /**
   * Authenticates user credentials
   */
  async login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Clears session cookie
   */
  async logout() {
    return request('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Retrieves currently authenticated user
   */
  async getMe() {
    return request('/auth/me', {
      method: 'GET',
    });
  },
};
