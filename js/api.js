// Live API Domain according to ICET FreeProject specification[cite: 1]
const API_BASE = 'https://projectapi.gerasim.in/api';

// Reusable GET helper[cite: 1]
async function apiGet(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            return { result: false, message: `Server error: ${res.status}` };
        }
        return await res.json();
    } catch (err) {
        console.error('GET error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Reusable POST helper[cite: 1]
async function apiPost(endpoint, body) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            console.error(`HTTP error! status: ${res.status}`);
            return { result: false, message: `Request failed with code ${res.status}` };
        }
        return await res.json();
    } catch (err) {
        console.error('POST error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Reusable DELETE helper
async function apiDelete(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });
        return await res.json();
    } catch (err) {
        console.error('DELETE error:', err);
        return { result: false, message: 'Network connection failed' };
    }
}

// Global UI Alert utility[cite: 1]
function showAlert(elementId, type, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
    }
}