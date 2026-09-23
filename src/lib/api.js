const TOKEN_KEY = 'edumed_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }

  return body;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),

  dashboardStats: () => request('/dashboard/stats'),

  getPatients: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/patients${qs ? `?${qs}` : ''}`);
  },
  getPatient: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  createAnnotation: (data) => request('/annotations', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnotation: (id, data) => request(`/annotations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnotation: (id) => request(`/annotations/${id}`, { method: 'DELETE' }),

  createVisit: (data) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),

  getAppointments: (date) => request(`/appointments${date ? `?date=${date}` : ''}`),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) })
};
