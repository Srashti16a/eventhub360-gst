import api from './api';

/**
 * Check-In Service — bridges legacy client actions to check-in flows
 */

export function checkinGuest(checkinData) {
  return Promise.resolve({ success: true, message: 'Guest checked in successfully' });
}

export function generateQrPass(qrData) {
  return Promise.resolve({ success: true, qr_code: `QR_${qrData.guestId}` });
}
