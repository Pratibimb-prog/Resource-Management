/**
 * JWT-aware API client. All fetch calls go through here.
 * Uses relative paths so it works regardless of port.
 */

const API_BASE = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

async function request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

        // Auto-logout on 401
        if (res.status === 401) {
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || `Request failed (${res.status})`);
        }

        return data;
    } catch (err) {
        if (err instanceof TypeError) {
            throw new Error('Cannot reach the server. Is it running on port 5000?');
        }
        throw err;
    }
}

const api = {
    auth: {
        login: (email, password) =>
            request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
    },

    resources: {
        getAll: () => request('/resources'),

        create: (data) =>
            request('/resources', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id, data) =>
            request(`/resources/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id) =>
            request(`/resources/${id}`, { method: 'DELETE' }),

        predict: (id) => request(`/resources/${id}/predict`),
    },
};
