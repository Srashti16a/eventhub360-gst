import apiFetch from './api';

export const getDashboardSummary = () => {
  return apiFetch(`/dashboard/stats`);
};
