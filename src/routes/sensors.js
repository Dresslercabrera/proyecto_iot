const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas de sensores requieren autenticación
router.use(authenticateToken);

// Obtener datos recientes
router.get('/recent', sensorController.getRecentData);

// Obtener todos los datos con paginación
router.get('/all', sensorController.getAllData);

// Obtener datos por rango de fechas
router.get('/range', sensorController.getDataByDateRange);

// Obtener estadísticas
router.get('/stats', sensorController.getStats);

// Obtener datos agrupados por hora
router.get('/hourly', sensorController.getHourlyData);

// Obtener último registro
router.get('/latest', sensorController.getLatest);

// Crear nuevo registro (para simulación)
router.post('/create', sensorController.createData);

module.exports = router;

