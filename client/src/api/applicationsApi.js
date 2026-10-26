import { request } from './client';

export const applicationsApi = {
  /**
   * Fetch paginated applications with search and filters
   */
  async getApplications(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });

    const queryString = query.toString();
    const endpoint = queryString ? `/applications?${queryString}` : '/applications';
    return request(endpoint, { method: 'GET' });
  },

  /**
   * Fetch a single application by ID
   */
  async getApplicationById(id) {
    return request(`/applications/${id}`, { method: 'GET' });
  },

  /**
   * Create a new application
   */
  async createApplication(data) {
    return request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Full update of an existing application
   */
  async updateApplication(id, data) {
    return request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an application
   */
  async deleteApplication(id) {
    return request(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Download CSV export
   */
  async exportCsv() {
    return request('/applications/export', {
      method: 'GET',
    });
  },
};
