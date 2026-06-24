import api from './api';

/**
 * Guest Service — all guest-related API calls
 */

export async function listGuests(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.sortBy) query.append('sortBy', params.sortBy);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);
  if (params.search) query.append('search', params.search);
  if (params.eventCategory && params.eventCategory !== 'All') query.append('eventCategory', params.eventCategory);
  if (params.rsvpStatus && params.rsvpStatus !== 'All') query.append('rsvpStatus', params.rsvpStatus);
  if (params.vipOnly) query.append('vipOnly', 'true');

  const qs = query.toString();
  return api.get(`/guests${qs ? `?${qs}` : ''}`);
}

export async function getGuest(id) {
  return api.get(`/guests/${id}`);
}

export async function createGuest(payload) {
  return api.post('/guests', payload);
}

export async function updateGuest(id, payload) {
  return api.put(`/guests/${id}`, payload);
}

export async function deleteGuest(id) {
  return api.delete(`/guests/${id}`);
}

export async function exportGuestsCsv(params = {}) {
  const query = new URLSearchParams();
  query.append('limit', '10000');
  if (params.search) query.append('search', params.search);
  if (params.eventCategory && params.eventCategory !== 'All') query.append('eventCategory', params.eventCategory);
  if (params.rsvpStatus && params.rsvpStatus !== 'All') query.append('rsvpStatus', params.rsvpStatus);
  if (params.vipOnly) query.append('vipOnly', 'true');
  return `/api/guests/export?${query.toString()}`;
}

export async function importGuests(guestsArray) {
  return api.post('/guests/import', guestsArray);
}
