// Login Form Event Listener
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        userName: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value.trim()
    };

    const res = await apiPost('/BusBooking/login', payload);
    if (res.result) {
        sessionStorage.setItem('user', JSON.stringify(res.data));
        window.location.href = 'index.html';
    } else {
        showAlert('alertBox', 'danger', res.message || 'Login failed.');
    }
});

// Register Form Event Listener
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        userName: document.getElementById('regName').value.trim(),
        emailId: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value.trim(),
        role: 'Customer'
    };

    const res = await apiPost('/BusBooking/AddNewUser', payload);
    if (res.result) {
        showAlert('alertBox', 'success', 'Account created! Please sign in.');
        document.getElementById('registerForm').reset();
    } else {
        showAlert('alertBox', 'danger', res.message || 'Registration failed.');
    }
});

// Auth Guard Utility
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
    }
    return JSON.parse(user);
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}