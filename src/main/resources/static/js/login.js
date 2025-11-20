const API_URL = 'http://localhost:8080/api';

// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    const icon = this.querySelector('i');
    icon.classList.toggle('ri-eye-line');
    icon.classList.toggle('ri-eye-off-line');
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const btnLoader = loginBtn.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    hideError();
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email,
                fullName: data.fullName,
                role: data.role,
                clubId: data.clubId,
                clubName: data.clubName
            }));
            
            // Show success message
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/clubconnect';
            }, 1000);
        } else {
            showError(data.message || 'Invalid username or password');
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again later.');
        loginBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: message,
        confirmButtonColor: '#3b82f6'
    });
}

function hideError() {
    // Not needed with SweetAlert2
}

function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
    });
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token is valid
        fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/clubconnect';
            } else {
                // Token is invalid, clear storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    }
});

// Auto-fill demo credentials when clicking on demo account info
document.querySelectorAll('.demo-account').forEach(account => {
    account.style.cursor = 'pointer';
    account.addEventListener('click', function() {
        const usernameCode = this.querySelector('p:first-of-type code').textContent;
        const passwordCode = this.querySelector('p:last-of-type code').textContent;
        
        document.getElementById('username').value = usernameCode;
        document.getElementById('password').value = passwordCode;
        
        // Add visual feedback
        this.style.background = '#eff6ff';
        setTimeout(() => {
            this.style.background = '#ffffff';
        }, 300);
    });
});
