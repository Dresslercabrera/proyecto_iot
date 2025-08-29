// Configuración global
const API_BASE_URL = window.location.origin + '/api';
let socket;
let charts = {};
let realtimeData = {
    labels: [],
    light: [],
    sound: []
};
let isRealtimePaused = false;
let currentUser = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

// Función principal de inicialización
async function initializeApp() {
    try {
        // Verificar autenticación
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/';
            return;
        }

        // Cargar datos del usuario
        await loadUserData();
        
        // Inicializar Socket.IO
        initializeSocket();
        
        // Configurar navegación
        setupNavigation();
        
        // Cargar datos iniciales
        await loadInitialData();
        
        // Inicializar gráficos
        initializeCharts();
        
        // Configurar controles
        setupControls();
        
        showNotification('Dashboard cargado correctamente', 'success');
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        showNotification('Error al cargar el dashboard', 'error');
    }
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            
            document.getElementById('userName').textContent = currentUser.nombre;
            document.getElementById('userEmail').textContent = currentUser.correo;
        } else {
            throw new Error('Token inválido');
        }
    } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/';
    }
}

// Inicializar Socket.IO
function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Conectado al servidor');
        updateConnectionStatus(true);
    });
    
    socket.on('disconnect', () => {
        console.log('Desconectado del servidor');
        updateConnectionStatus(false);
    });
    
    socket.on('sensorData', (data) => {
        if (!isRealtimePaused) {
            updateRealtimeData(data);
        }
        updateCurrentValues(data);
        updateLastUpdate();
    });
    
    socket.on('welcome', (data) => {
        console.log('Mensaje del servidor:', data.message);
    });
}

// Actualizar estado de conexión
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connectionStatus');
    const icon = statusElement.querySelector('i');
    const text = statusElement.querySelector('span');
    
    if (connected) {
        statusElement.className = 'connection-status';
        text.textContent = 'Conectado';
        icon.style.color = '#27ae60';
    } else {
        statusElement.className = 'connection-status disconnected';
        text.textContent = 'Desconectado';
        icon.style.color = '#e74c3c';
    }
}

// Configurar navegación
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = item.getAttribute('data-section');
            
            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Mostrar sección correspondiente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${targetSection}-section`).classList.add('active');
            
            // Actualizar título
            const titles = {
                'dashboard': 'Dashboard Principal',
                'realtime': 'Monitoreo en Tiempo Real',
                'history': 'Historial de Datos',
                'analytics': 'Análisis y Estadísticas'
            };
            document.getElementById('pageTitle').textContent = titles[targetSection];
            
            // Cargar datos específicos de la sección
            loadSectionData(targetSection);
        });
    });
}

// Cargar datos iniciales
async function loadInitialData() {
    showLoading();
    
    try {
        // Cargar estadísticas generales
        await loadStats();
        
        // Cargar datos recientes
        await loadRecentData();
        
        // Cargar datos por hora
        await loadHourlyData();
        
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        showNotification('Error al cargar datos iniciales', 'error');
    } finally {
        hideLoading();
    }
}

// Cargar estadísticas
async function loadStats() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateStatsDisplay(data.stats);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// Actualizar display de estadísticas
function updateStatsDisplay(stats) {
    document.getElementById('totalRecords').textContent = stats.total_registros || 0;
    
    // Calcular tiempo activo (simulado)
    const startDate = new Date(stats.fecha_primer_registro);
    const now = new Date();
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('uptime').textContent = `${diffDays} días`;
}

// Cargar datos recientes
async function loadRecentData() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/recent?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                updateCurrentValues(data.data[0]);
            }
        }
    } catch (error) {
        console.error('Error cargando datos recientes:', error);
    }
}

// Actualizar valores actuales
function updateCurrentValues(data) {
    document.getElementById('currentLight').textContent = data.luz || '--';
    document.getElementById('currentSound').textContent = data.sonido || '--';
    
    // Simular cambios (en una implementación real, compararías con valores anteriores)
    const lightChange = Math.random() > 0.5 ? '+' : '-';
    const soundChange = Math.random() > 0.5 ? '+' : '-';
    
    document.getElementById('lightChange').textContent = `${lightChange}${Math.floor(Math.random() * 10)}%`;
    document.getElementById('soundChange').textContent = `${soundChange}${Math.floor(Math.random() * 15)}%`;
}

// Cargar datos por hora
async function loadHourlyData() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/hourly?hours=24`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateHourlyCharts(data.data);
        }
    } catch (error) {
        console.error('Error cargando datos por hora:', error);
    }
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de luz
    const lightCtx = document.getElementById('lightChart').getContext('2d');
    charts.light = new Chart(lightCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nivel de Luz',
                data: [],
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });

    // Gráfico de sonido
    const soundCtx = document.getElementById('soundChart').getContext('2d');
    charts.sound = new Chart(soundCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Nivel de Sonido',
                data: [],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });

    // Gráfico en tiempo real
    const realtimeCtx = document.getElementById('realtimeChart').getContext('2d');
    charts.realtime = new Chart(realtimeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Luz',
                data: [],
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                borderWidth: 2,
                fill: false
            }, {
                label: 'Sonido',
                data: [],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

// Actualizar gráficos por hora
function updateHourlyCharts(data) {
    const labels = data.map(item => {
        const date = new Date(item.hora);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    });
    
    const lightData = data.map(item => parseFloat(item.promedio_luz));
    const soundData = data.map(item => parseFloat(item.promedio_sonido));
    
    // Actualizar gráfico de luz
    charts.light.data.labels = labels;
    charts.light.data.datasets[0].data = lightData;
    charts.light.update();
    
    // Actualizar gráfico de sonido
    charts.sound.data.labels = labels;
    charts.sound.data.datasets[0].data = soundData;
    charts.sound.update();
}

// Actualizar datos en tiempo real
function updateRealtimeData(data) {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('es-ES');
    
    realtimeData.labels.push(timeLabel);
    realtimeData.light.push(data.luz);
    realtimeData.sound.push(data.sonido);
    
    // Mantener solo los últimos N puntos
    const maxPoints = parseInt(document.getElementById('dataPoints').value) || 50;
    
    if (realtimeData.labels.length > maxPoints) {
        realtimeData.labels.shift();
        realtimeData.light.shift();
        realtimeData.sound.shift();
    }
    
    // Actualizar gráfico
    charts.realtime.data.labels = realtimeData.labels;
    charts.realtime.data.datasets[0].data = realtimeData.light;
    charts.realtime.data.datasets[1].data = realtimeData.sound;
    charts.realtime.update('none');
}

// Configurar controles
function setupControls() {
    // Control de puntos de datos
    const dataPointsSlider = document.getElementById('dataPoints');
    const dataPointsValue = document.getElementById('dataPointsValue');
    
    dataPointsSlider.addEventListener('input', (e) => {
        dataPointsValue.textContent = e.target.value;
    });
    
    // Configurar fechas por defecto para historial
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    document.getElementById('endDate').value = now.toISOString().slice(0, 16);
    document.getElementById('startDate').value = yesterday.toISOString().slice(0, 16);
}

// Pausar/reanudar tiempo real
function pauseRealtime() {
    const btn = document.getElementById('pauseBtn');
    const icon = btn.querySelector('i');
    const text = btn.querySelector('span') || btn;
    
    isRealtimePaused = !isRealtimePaused;
    
    if (isRealtimePaused) {
        btn.classList.add('paused');
        icon.className = 'fas fa-play';
        text.textContent = ' Reanudar';
    } else {
        btn.classList.remove('paused');
        icon.className = 'fas fa-pause';
        text.textContent = ' Pausar';
    }
}

// Cargar datos de sección específica
async function loadSectionData(section) {
    switch (section) {
        case 'history':
            await loadHistoryData();
            break;
        case 'analytics':
            await loadAnalyticsData();
            break;
    }
}

// Cargar datos de historial
async function loadHistoryData() {
    try {
        showLoading();
        
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            showNotification('Por favor selecciona un rango de fechas', 'error');
            return;
        }
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/range?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayHistoryData(data.data);
        }
    } catch (error) {
        console.error('Error cargando historial:', error);
        showNotification('Error al cargar historial', 'error');
    } finally {
        hideLoading();
    }
}

// Mostrar datos de historial
function displayHistoryData(data) {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${new Date(item.fecha).toLocaleString('es-ES')}</td>
            <td>${item.luz}</td>
            <td>${item.sonido}</td>
        `;
        tbody.appendChild(row);
    });
}

// Cargar datos de análisis
async function loadAnalyticsData() {
    try {
        showLoading();
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayAnalyticsData(data.stats);
        }
    } catch (error) {
        console.error('Error cargando análisis:', error);
        showNotification('Error al cargar análisis', 'error');
    } finally {
        hideLoading();
    }
}

// Mostrar datos de análisis
function displayAnalyticsData(stats) {
    const container = document.getElementById('generalStats');
    container.innerHTML = `
        <div class="stats-item">
            <span class="stats-label">Total de registros:</span>
            <span class="stats-value">${stats.total_registros}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Promedio de luz:</span>
            <span class="stats-value">${parseFloat(stats.promedio_luz).toFixed(2)}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Luz mínima:</span>
            <span class="stats-value">${stats.min_luz}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Luz máxima:</span>
            <span class="stats-value">${stats.max_luz}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Promedio de sonido:</span>
            <span class="stats-value">${parseFloat(stats.promedio_sonido).toFixed(2)}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Sonido mínimo:</span>
            <span class="stats-value">${stats.min_sonido}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Sonido máximo:</span>
            <span class="stats-value">${stats.max_sonido}</span>
        </div>
    `;
}

// Exportar datos
async function exportData(format) {
    try {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            showNotification('Por favor selecciona un rango de fechas', 'error');
            return;
        }
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/sensors/range?startDate=${startDate}&endDate=${endDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (format === 'csv') {
                exportToCSV(data.data);
            } else if (format === 'json') {
                exportToJSON(data.data);
            }
        }
    } catch (error) {
        console.error('Error exportando datos:', error);
        showNotification('Error al exportar datos', 'error');
    }
}

// Exportar a CSV
function exportToCSV(data) {
    const headers = ['ID', 'Fecha', 'Luz', 'Sonido'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            new Date(row.fecha).toISOString(),
            row.luz,
            row.sonido
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'sensor-data.csv', 'text/csv');
}

// Exportar a JSON
function exportToJSON(data) {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'sensor-data.json', 'application/json');
}

// Descargar archivo
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`Archivo ${filename} descargado`, 'success');
}

// Actualizar última actualización
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        `Última actualización: ${now.toLocaleTimeString('es-ES')}`;
}

// Toggle sidebar (móvil)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    if (socket) {
        socket.disconnect();
    }
    
    window.location.href = '/';
}

// Funciones de utilidad
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.className = `notification ${type}`;
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

// Cerrar sidebar al hacer clic fuera (móvil)
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !sidebarToggle.contains(e.target) && 
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

