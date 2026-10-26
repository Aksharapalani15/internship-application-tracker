import { request } from './client';

export const profileApi = {
  /**
   * Retrieves profile of current user
   */
  async getProfile() {
    return request('/profile', { method: 'GET' });
  },

  /**
   * Updates user name and/or email
   */
  async updateProfile(data) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
