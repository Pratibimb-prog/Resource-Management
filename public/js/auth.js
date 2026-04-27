/** Login page controller */
document.addEventListener('DOMContentLoaded', () => {
    // Already logged in → go to dashboard
    if (localStorage.getItem('token')) {
        window.location.href = '/dashboard.html';
        return;
    }

    const form      = document.getElementById('login-form');
    const errorEl   = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-btn');

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add('show');
    }
    function hideError() {
        errorEl.classList.remove('show');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Signing in…';

        try {
            const data = await api.auth.login(email, password);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                name:  data.name,
                email: data.email,
                role:  data.role,
                id:    data._id,
            }));

            window.location.href = '/dashboard.html';
        } catch (err) {
            showError(err.message || 'Invalid credentials. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Sign In';
        }
    });
});
