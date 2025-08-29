const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de acceso requerido' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar que el usuario existe
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no válido' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expirado' 
            });
        }
        
        return res.status(403).json({ 
            success: false, 
            message: 'Token no válido' 
        });
    }
};

// Middleware opcional para rutas que pueden funcionar con o sin autenticación
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Si hay error en el token opcional, continuar sin usuario
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};

