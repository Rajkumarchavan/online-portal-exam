// ============================================
// ONLINE EXAM PORTAL - Shared JS Utilities
// ============================================

const BASE_URL = 'http://localhost:8080/api';

// API helper
const api = {
    async request(method, endpoint, body = null) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const res = await fetch(BASE_URL + endpoint, options);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Request failed');
        }
        return data;
    },
    get: (url) => api.request('GET', url),
    post: (url, body) => api.request('POST', url, body),
    put: (url, body) => api.request('PUT', url, body),
    delete: (url) => api.request('DELETE', url),
};

// Auth guard
function requireAuth(role) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (!token) { window.location.href = 'index.html'; return false; }
    if (role && userRole !== role) { window.location.href = 'index.html'; return false; }
    return true;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function showSection(name) {
    document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(name + 'Section').classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const btn = [...document.querySelectorAll('.nav-btn')]
        .find(b => b.getAttribute('onclick')?.includes(`'${name}'`));
    if (btn) btn.classList.add('active');
}

function showAlert(id, message, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = `alert show ${type}`;
    setTimeout(() => el.classList.remove('show'), 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}
