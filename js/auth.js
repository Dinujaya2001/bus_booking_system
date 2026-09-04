// Login Form Event Listener
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // ASP.NET Core endpoint expects userName / emailId and password
    const payload = {
        userName: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value.trim()
    };

    const res = await apiPost('/BusBooking/login', payload);
    
    if (res.result) {
        sessionStorage.setItem('user', JSON.stringify(res.data));
        window.location.href = 'index.html';
    } else {
        showAlert('alertBox', 'danger', res.message || 'Invalid credentials or login failed.');
    }
});

// Register Form Event Listener
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullNameVal = document.getElementById('regName').value.trim();
    const emailVal = document.getElementById('regEmail').value.trim();
    const passwordVal = document.getElementById('regPassword').value.trim();

    // Backend User model schema matching
    const payload = {
        userId: 0,
        userName: emailVal,        // බොහෝ විට unique identifier එක ලෙස email එක ගනී
        fullName: fullNameVal,
        emailId: emailVal,
        password: passwordVal,
        role: 'Customer'
    };

    const res = await apiPost('/BusBooking/AddNewUser', payload);
    
    if (res.result) {
        showAlert('alertBox', 'success', 'Account created successfully! Please sign in.');
        document.getElementById('registerForm').reset();
        
        // සාර්ථක වූ පසු ස්වයංක්‍රීයව Login Tab එකට මාරු කිරීම
        const loginTabBtn = document.querySelector('button[data-bs-target="#loginTab"]');
        if (loginTabBtn) {
            loginTabBtn.click();
        }
    } else {
        showAlert('alertBox', 'danger', res.message || 'Registration failed.');
    }
});

// Auth Guard Utility (Protected Pages සඳහා)
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

// User Logout Utility
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}