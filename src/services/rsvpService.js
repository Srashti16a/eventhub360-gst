import apiFetch from './api';

export const submitRsvp = (rsvpData) => {
  return apiFetch(`/rsvp`, {
    method: 'POST',
    body: JSON.stringify(rsvpData),
  });
};

export const getRsvpStatus = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return apiFetch(`/rsvp${queryStr ? `?${queryStr}` : ''}`);
};
