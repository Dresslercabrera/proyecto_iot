const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    try {
        const { nombre, correo, contraseña } = req.body;

        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({ 
                success: false, 
                message: "Todos los campos son requeridos" 
            });
        }

        const userId = await User.create({ nombre, correo, contraseña });

        res.status(201).json({ 
            success: true, 
            message: "Usuario registrado exitosamente", 
            userId 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error al registrar el usuario" 
        });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({ 
                success: false, 
                message: "Correo y contraseña son requeridos" 
            });
        }

        const user = await User.findByEmail(correo);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales inválidas" 
            });
        }

        const isMatch = await user.verifyPassword(contraseña);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales inválidas" 
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: "24h" } 
        );

        res.json({ 
            success: true, 
            message: "Inicio de sesión exitoso", 
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error al iniciar sesión" 
        });
    }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
        // El usuario ya está disponible en req.user gracias al middleware authenticateToken
        res.json({ 
            success: true, 
            user: req.user.toJSON() 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al obtener el perfil del usuario" 
        });
    }
};

