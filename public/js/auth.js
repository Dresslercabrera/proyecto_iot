// Configuración de la API
const API_BASE_URL = window.location.origin + '/api';

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const loadingOverlay = document.getElementById('loadingOverlay');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Event listeners
loginFormElement.addEventListener('submit', handleLogin);
registerFormElement.addEventListener('submit', handleRegister);

// Verificar si ya está autenticado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verificar si el token es válido
        verifyToken(token);
    }
});

// Función para cambiar a registro
function switchToRegister() {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
}

// Función para cambiar a login
function switchToLogin() {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
}

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Función para mostrar loading
function showLoading() {
    loadingOverlay.classList.add('show');
}

// Función para ocultar loading
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// Función para mostrar notificación
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Función para manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: email,
                contraseña: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            showNotification('Inicio de sesión exitoso', 'success');
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            showNotification(data.message || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        hideLoading();
    }
}

// Función para manejar registro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: name,
                correo: email,
                contraseña: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'success');
            
            // Limpiar formulario
            document.getElementById('registerFormElement').reset();
            
            // Cambiar a login después de 2 segundos
            setTimeout(() => {
                switchToLogin();
            }, 2000);
        } else {
            showNotification(data.message || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        hideLoading();
    }
}

// Función para verificar token
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Token válido, redirigir al dashboard
            window.location.href = '/dashboard';
        } else {
            // Token inválido, limpiar localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }
}

// Validación en tiempo real para el email
document.getElementById('loginEmail').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});

document.getElementById('registerEmail').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});

// Validación de confirmación de contraseña
document.getElementById('confirmPassword').addEventListener('input', function(e) {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = e.target.value;
    
    if (confirmPassword && password !== confirmPassword) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#e1e5e9';
    }
});

