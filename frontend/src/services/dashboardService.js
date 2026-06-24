import api from './api';

/**
 * Dashboard Service — statistics and summary data
 */

export async function getDashboardStats() {
  return api.get('/dashboard/stats');
}
