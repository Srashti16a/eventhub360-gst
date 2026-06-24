/**
 * EventHub360 — Centralized API client
 * Uses native fetch (no extra dependencies needed).
 * Base URL defaults to '/api' which Vite proxies to http://localhost:3000/api.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(method, path, body = null, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    method,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);

  // Handle non-JSON responses (e.g. CSV export)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    return { raw: true, status: res.status, response: res };
  }

  const data = await res.json();
  if (!res.ok && !data.success) {
    const err = new Error(data.error?.message || data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;
