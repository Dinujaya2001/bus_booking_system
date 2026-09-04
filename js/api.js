const API_BASE = 'https://your-api-domain.com/api'; // Replace with your live API base URL

// Shared GET helper
async function apiGet(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        return await res.json();
    } catch (err) {
        console.error('GET error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Shared POST helper
async function apiPost(endpoint, body) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        console.error('POST error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Shared DELETE helper
async function apiDelete(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE'
        });
        return await res.json();
    } catch (err) {
        console.error('DELETE error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Bootstrap Alert Helper
function showAlert(elementId, type, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">${message}</div>`;
    }
}