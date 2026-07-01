import api from './api';

/**
 * Transportation Service — interfaces with the TypeScript Express backend
 */

export async function getDrivers() {
  return api.get('/transportation/drivers');
}

export async function getVehicles() {
  return api.get('/transportation/vehicles');
}

export async function getAssignments(eventId = '') {
  const query = eventId ? `?eventId=${eventId}` : '';
  return api.get(`/transportation/assignments${query}`);
}

export async function assignFleet(payload) {
  return api.post('/transportation/assignments', payload);
}

export async function deleteAssignment(id) {
  return api.delete(`/transportation/assignments/${id}`);
}

export async function getRoutes() {
  return api.get('/transportation/routes');
}

export async function createRoute(payload) {
  return api.post('/transportation/routes', payload);
}

export async function optimizeRoute(id) {
  return api.post(`/transportation/routes/${id}/optimize`);
}

export async function getTransfers(eventId = '') {
  const query = eventId ? `?eventId=${eventId}` : '';
  return api.get(`/transportation/transfers${query}`);
}

export async function getTransfer(id) {
  return api.get(`/transportation/transfers/${id}`);
}

export async function scheduleTransfer(payload) {
  return api.post('/transportation/transfers', payload);
}

export async function updateTransfer(id, payload) {
  return api.put(`/transportation/transfers/${id}`, payload);
}

export async function deleteTransfer(id) {
  return api.delete(`/transportation/transfers/${id}`);
}

export async function updateDriverStatus(id, status) {
  return api.put(`/transportation/drivers/${id}/status`, { status });
}

export async function updateVehicleStatus(id, status) {
  return api.put(`/transportation/vehicles/${id}/status`, { status });
}

export async function getMaintenances(vehicleId = '') {
  const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
  return api.get(`/transportation/maintenance${query}`);
}

export async function scheduleMaintenance(payload) {
  return api.post('/transportation/maintenance', payload);
}

export async function updateMaintenance(id, payload) {
  return api.put(`/transportation/maintenance/${id}`, payload);
}

export async function getActivityLogs() {
  return api.get('/transportation/activity-logs');
}

export async function getDashboardOverview(eventId) {
  return api.get(`/transportation/dashboard/overview/${eventId}`);
}

export async function refreshAnalytics(eventId) {
  return api.post(`/transportation/dashboard/refresh/${eventId}`);
}

export async function getAllocVehicles(eventId) {
  return api.get(`/transportation/alloc-vehicles?eventId=${eventId}`);
}

export async function getGuestQueue(eventId, search = '') {
  const query = search ? `&search=${encodeURIComponent(search)}` : '';
  return api.get(`/transportation/guest-queue?eventId=${eventId}${query}`);
}

export async function assignGuestToVehicle(payload) {
  return api.post('/transportation/assign-guest', payload);
}

export async function unassignGuestFromVehicle(payload) {
  return api.post('/transportation/unassign-guest', payload);
}
