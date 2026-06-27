import apiFetch from './api';

export const checkinGuest = (checkinData) => {
  return apiFetch(`/checkin`, {
    method: 'POST',
    body: JSON.stringify(checkinData),
  });
};

export const generateQrPass = (qrData) => {
  return apiFetch(`/qr/generate`, {
    method: 'POST',
    body: JSON.stringify(qrData),
  });
};
