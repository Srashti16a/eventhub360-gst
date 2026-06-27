import api from './api';

/**
 * RSVP Service — bridges legacy client actions to unified Guest endpoints
 */

export function submitRsvp(rsvpData) {
  return api.put(`/guests/${rsvpData.guestId}`, { status: rsvpData.status });
}

export function getRsvpStatus(params = {}) {
  const query = new URLSearchParams(params).toString();
  return api.get(`/guests${query ? `?${query}` : ''}`);
}
