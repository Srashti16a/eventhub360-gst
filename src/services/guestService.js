import apiFetch from './api';

export const getGuests = (params = {}) => {
  const queryStr = new URLSearchParams(params).toString();
  return apiFetch(`/guests${queryStr ? `?${queryStr}` : ''}`);
};

export const getGuestById = (id) => {
  return apiFetch(`/guests/${id}`);
};

export const createGuest = (guestData) => {
  return apiFetch(`/guests`, {
    method: 'POST',
    body: JSON.stringify(guestData),
  });
};

export const updateGuest = (id, guestData) => {
  return apiFetch(`/guests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(guestData),
  });
};

export const deleteGuest = (id) => {
  return apiFetch(`/guests/${id}`, {
    method: 'DELETE',
  });
};
