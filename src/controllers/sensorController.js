const db = require('../config/db'); // conexión MySQL
let io; // instancia de socket.io (inyectada desde server.js)

// ================== SOCKET ==================
const initSocket = (socketIo) => {
    io = socketIo;
};

// ================== OBTENER DATOS ==================

// Datos recientes (últimos X registros)
exports.getRecentData = (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const query = "SELECT id, luz, sonido, fecha FROM datos_sensores ORDER BY fecha DESC LIMIT ?";
    
    db.query(query, [limit], (err, results) => {
        if (err) {
            console.error("❌ Error en getRecentData:", err);
            return res.status(500).json({ success: false, message: "Error al obtener datos" });
        }
        res.json({ success: true, data: results });
    });
};

// Todos los datos con paginación
exports.getAllData = (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const query = "SELECT id, luz, sonido, fecha FROM datos_sensores ORDER BY fecha DESC LIMIT ? OFFSET ?";
    
    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.error("❌ Error en getAllData:", err);
            return res.status(500).json({ success: false, message: "Error al obtener datos" });
        }
        res.json({ 
            success: true, 
            data: results,
            pagination: { page, limit, offset }
        });
    });
};

// Datos por rango de fechas
exports.getDataByDateRange = (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: "Fechas de inicio y fin son requeridas" });
    }

    const query = "SELECT id, luz, sonido, fecha FROM datos_sensores WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC";
    
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error("❌ Error en getDataByDateRange:", err);
            return res.status(500).json({ success: false, message: "Error al obtener datos" });
        }
        res.json({ success: true, data: results });
    });
};

// Estadísticas (promedios, máximos y mínimos)
exports.getStats = (req, res) => {
    const query = `
        SELECT 
            AVG(sonido) AS promedio_sonido,
            MIN(sonido) AS min_sonido,
            MAX(sonido) AS max_sonido,
            AVG(luz) AS promedio_luz,
            MIN(luz) AS min_luz,
            MAX(luz) AS max_luz
        FROM datos_sensores
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error en getStats:", err);
            return res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
        }
        res.json({ success: true, stats: results[0] });
    });
};

// Datos agrupados por hora (últimas X horas)
exports.getHourlyData = (req, res) => {
    const hours = parseInt(req.query.hours) || 24;
    const query = `
        SELECT DATE_FORMAT(fecha, '%Y-%m-%d %H:00:00') AS hora, 
               AVG(sonido) AS promedio_sonido, 
               AVG(luz) AS promedio_luz
        FROM datos_sensores
        WHERE fecha >= NOW() - INTERVAL ? HOUR
        GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d %H:00:00')
        ORDER BY hora ASC
    `;
    
    db.query(query, [hours], (err, results) => {
        if (err) {
            console.error("❌ Error en getHourlyData:", err);
            return res.status(500).json({ success: false, message: "Error al obtener datos por hora" });
        }
        res.json({ success: true, data: results });
    });
};

// Último registro
exports.getLatest = (req, res) => {
    const query = "SELECT id, luz, sonido, fecha FROM datos_sensores ORDER BY fecha DESC LIMIT 1";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error en getLatest:", err);
            return res.status(500).json({ success: false, message: "Error al obtener último registro" });
        }
        res.json({ success: true, data: results[0] });
    });
};

// ================== CREAR DATOS ==================

// Crear nuevo registro (desde ESP32 o simulador)
exports.createData = (req, res) => {
    const { luz, sonido } = req.body;
    if (luz === undefined || sonido === undefined) {
        return res.status(400).json({ success: false, message: "Valores de luz y sonido son requeridos" });
    }

    const query = "INSERT INTO datos_sensores (luz, sonido) VALUES (?, ?)";
    
    db.query(query, [luz, sonido], (err, result) => {
        if (err) {
            console.error("❌ Error al insertar:", err);
            return res.status(500).json({ success: false, message: "Error al crear datos de sensor" });
        }

        const newData = { id: result.insertId, fecha: new Date(), luz, sonido };

        // 🔥 Emitir en tiempo real si hay sockets conectados
        if (io) io.emit("nuevo_dato", newData);

        res.status(201).json({ success: true, message: "Datos insertados correctamente", data: newData });
    });
};

// ================== EXPORTS ==================
exports.initSocket = initSocket;
