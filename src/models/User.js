const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.correo = data.correo;
        this.contraseña = data.contraseña;
        this.fecha_registro = data.fecha_registro;
    }

    // Crear nuevo usuario
    static async create(userData) {
        try {
            const { nombre, correo, contraseña } = userData;
            
            // Verificar si el usuario ya existe
            const existingUser = await this.findByEmail(correo);
            if (existingUser) {
                throw new Error('El correo ya está registrado');
            }

            // Encriptar contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
                [nombre, correo, hashedPassword]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por email
    static async findByEmail(correo) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE correo = ?',
                [correo]
            );
            
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE id = ?',
                [id]
            );
            
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Verificar contraseña
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.contraseña);
    }

    // Obtener datos del usuario sin contraseña
    toJSON() {
        const { contraseña, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;

