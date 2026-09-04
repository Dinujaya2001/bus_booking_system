document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user already logged in
    const activeUser = sessionStorage.getItem('user');
    if (activeUser && window.location.pathname.endsWith('login.html')) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Handle Login Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnLogin');
            btn.disabled = true;
            btn.innerText = 'Signing In...';

            const payload = {
                userName: document.getElementById('loginUsername').value.trim(),
                password: document.getElementById('loginPassword').value.trim()
            };

            const res = await apiPost('/BusBooking/login', payload);
            btn.disabled = false;
            btn.innerText = 'Sign In';

            if (res && res.result === true) {
                sessionStorage.setItem('user', JSON.stringify(res.data));
                window.location.href = 'index.html';
            } else {
                showAlert('alertBox', 'danger', (res && res.message) ? res.message : 'Invalid login credentials.');
            }
        });
    }

    // 3. Handle Registration Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnRegister');
            btn.disabled = true;
            btn.innerText = 'Creating account...';

            const fullName = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const password = document.getElementById('regPassword').value.trim();

            const payload = {
                userId: 0,
                userName: email,
                fullName: fullName,
                emailId: email,
                password: password,
                role: 'Customer'
            };

            const res = await apiPost('/BusBooking/AddNewUser', payload);
            btn.disabled = false;
            btn.innerText = 'Register';

            if (res && res.result === true) {
                showAlert('alertBox', 'success', 'Registration successful! Please login.');
                registerForm.reset();
                const loginTab = document.getElementById('pills-login-tab');
                if (loginTab) loginTab.click();
            } else {
                showAlert('alertBox', 'danger', (res && res.message) ? res.message : 'Failed to register.');
            }
        });
    }
});

// Guard helper for client pages
function checkAuth() {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userJson);
}

// User Logout
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}