import { request } from './client';

export const dashboardApi = {
  /**
   * Retrieves high-level stats, counts, and conversion rates
   */
  async getStats() {
    return request('/dashboard/stats', { method: 'GET' });
  },

  /**
   * Retrieves monthly application submission velocity for charts
   */
  async getActivity() {
    return request('/dashboard/activity', { method: 'GET' });
  },

  /**
   * Retrieves upcoming and overdue deadlines and follow-up reminders
   */
  async getUpcomingDeadlines() {
    return request('/dashboard/upcoming-deadlines', { method: 'GET' });
  },
};
