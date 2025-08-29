// ================== IMPORTS ==================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const db = require('./src/config/db'); // conexión a MySQL
const authRoutes = require('./src/routes/auth');
const sensorRoutes = require('./src/routes/sensors');
const { initSocket } = require('./src/controllers/sensorController');

// ================== APP & SERVER ==================
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// ================== MIDDLEWARES ==================

// Seguridad
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Parseo JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ================== RUTAS ==================
app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// ================== ERRORES ==================

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Errores globales
app.use((error, req, res, next) => {
    console.error('❌ Error en el servidor:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ================== SOCKET.IO ==================
io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);

    // mensaje de bienvenida
    socket.emit('welcome', { message: 'Conectado al servidor de sensores' });

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
    });
});

// Inyectar instancia de socket en el controller
initSocket(io);

// ================== INICIO DEL SERVIDOR ==================
async function startServer() {
    try {
        // Probar conexión a MySQL
        db.query('SELECT 1', (err) => {
            if (err) {
                console.error('❌ Error al conectar a la base de datos:', err.message);
                process.exit(1);
            }
            console.log('✅ Conexión a MySQL establecida');
        });

        // Iniciar servidor
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🔌 WebSocket habilitado para datos en tiempo real`);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor...');
    server.close(() => process.exit(0));
});

startServer();
