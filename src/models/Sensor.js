const { pool } = require('../config/database');

class Sensor {
    constructor(data) {
        this.id = data.id;
        this.luz = data.luz;
        this.sonido = data.sonido;
        this.fecha = data.fecha;
    }

    // Obtener todos los datos de sensores con paginación
    static async getAll(limit = 100, offset = 0) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM datos_sensores ORDER BY fecha DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );
            
            return rows.map(row => new Sensor(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos recientes (últimos N registros)
    static async getRecent(limit = 50) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM datos_sensores ORDER BY fecha DESC LIMIT ?',
                [limit]
            );
            
            return rows.map(row => new Sensor(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos por rango de fechas
    static async getByDateRange(startDate, endDate) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM datos_sensores WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC',
                [startDate, endDate]
            );
            
            return rows.map(row => new Sensor(row));
        } catch (error) {
            throw error;
        }
    }

    // Obtener estadísticas básicas
    static async getStats() {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_registros,
                    AVG(luz) as promedio_luz,
                    MIN(luz) as min_luz,
                    MAX(luz) as max_luz,
                    AVG(sonido) as promedio_sonido,
                    MIN(sonido) as min_sonido,
                    MAX(sonido) as max_sonido,
                    MIN(fecha) as fecha_primer_registro,
                    MAX(fecha) as fecha_ultimo_registro
                FROM datos_sensores
            `);
            
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos agrupados por hora para gráficos
    static async getHourlyData(hours = 24) {
        try {
            const [rows] = await pool.execute(`
                SELECT 
                    DATE_FORMAT(fecha, '%Y-%m-%d %H:00:00') as hora,
                    AVG(luz) as promedio_luz,
                    AVG(sonido) as promedio_sonido,
                    COUNT(*) as cantidad_registros
                FROM datos_sensores 
                WHERE fecha >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                GROUP BY DATE_FORMAT(fecha, '%Y-%m-%d %H:00:00')
                ORDER BY hora ASC
            `, [hours]);
            
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Insertar nuevo dato de sensor
    static async create(sensorData) {
        try {
            const { luz, sonido } = sensorData;
            
            const [result] = await pool.execute(
                'INSERT INTO datos_sensores (luz, sonido) VALUES (?, ?)',
                [luz, sonido]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Obtener último registro
    static async getLatest() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM datos_sensores ORDER BY fecha DESC LIMIT 1'
            );
            
            return rows.length > 0 ? new Sensor(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Sensor;

