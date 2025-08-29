# Sensor Dashboard - Sistema de Monitoreo en Tiempo Real

Una aplicación web completa desarrollada en Node.js para el monitoreo de sensores de luz y sonido en tiempo real, con sistema de autenticación, dashboard profesional y visualización de datos históricos.

## Características

- 🔐 **Sistema de Autenticación**: Login y registro de usuarios con JWT
- 📊 **Dashboard Profesional**: Visualización de datos en tiempo real
- 📈 **Gráficos Interactivos**: Charts.js para visualización de tendencias
- 🔄 **Tiempo Real**: WebSocket con Socket.IO para actualizaciones en vivo
- 📱 **Responsive Design**: Compatible con dispositivos móviles
- 📋 **Historial de Datos**: Consulta y exportación de datos históricos
- 📊 **Análisis y Estadísticas**: Métricas y análisis de los datos de sensores

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2 (conexión a base de datos)
- Socket.IO (comunicación en tiempo real)
- JWT (autenticación)
- bcryptjs (encriptación de contraseñas)
- CORS (cross-origin requests)

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Chart.js (gráficos)
- Font Awesome (iconos)
- Socket.IO Client (tiempo real)

### Base de Datos
- MySQL (XAMPP)
- Tablas: usuarios, sesiones, login_logs, datos_sensores

## Instalación y Configuración

### Prerrequisitos
- Node.js (v14 o superior)
- XAMPP con MySQL
- Git

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sensor-dashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos
1. Iniciar XAMPP y activar MySQL
2. Importar el archivo `sensores_db.sql` en phpMyAdmin
3. Verificar que la base de datos `sensores_db` esté creada

### 4. Configurar variables de entorno
Editar el archivo `.env` con tus configuraciones:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sensores_db
DB_PORT=3306

# Configuración del servidor
PORT=3000
NODE_ENV=development

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_cambiar_en_produccion

# Configuración de sesiones
SESSION_SECRET=otra_clave_secreta_para_sesiones
```

### 5. Ejecutar la aplicación

#### Modo desarrollo
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## Estructura del Proyecto

```
sensor-dashboard/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de base de datos
│   ├── controllers/
│   │   ├── authController.js    # Controlador de autenticación
│   │   └── sensorController.js  # Controlador de sensores
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticación
│   ├── models/
│   │   ├── User.js              # Modelo de usuario
│   │   └── Sensor.js            # Modelo de sensor
│   └── routes/
│       ├── auth.js              # Rutas de autenticación
│       └── sensors.js           # Rutas de sensores
├── public/
│   ├── css/
│   │   ├── auth.css             # Estilos de autenticación
│   │   └── dashboard.css        # Estilos del dashboard
│   └── js/
│       ├── auth.js              # JavaScript de autenticación
│       └── dashboard.js         # JavaScript del dashboard
├── views/
│   ├── index.html               # Página de login/registro
│   └── dashboard.html           # Dashboard principal
├── server.js                    # Servidor principal
├── package.json                 # Dependencias y scripts
├── .env                         # Variables de entorno
└── README.md                    # Documentación
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario (requiere token)

### Sensores
- `GET /api/sensors/recent` - Obtener datos recientes
- `GET /api/sensors/all` - Obtener todos los datos (paginado)
- `GET /api/sensors/range` - Obtener datos por rango de fechas
- `GET /api/sensors/stats` - Obtener estadísticas generales
- `GET /api/sensors/hourly` - Obtener datos agrupados por hora
- `GET /api/sensors/latest` - Obtener último registro
- `POST /api/sensors/create` - Crear nuevo registro

## Uso de la Aplicación

### 1. Registro/Login
- Acceder a `http://localhost:3000`
- Crear una nueva cuenta o iniciar sesión con credenciales existentes

### 2. Dashboard Principal
- Vista general con estadísticas actuales
- Gráficos de tendencias de luz y sonido (24h)
- Valores en tiempo real

### 3. Monitoreo en Tiempo Real
- Gráfico que se actualiza automáticamente
- Controles para pausar/reanudar
- Configuración de puntos de datos a mostrar

### 4. Historial de Datos
- Consulta por rango de fechas
- Tabla con todos los registros
- Exportación a CSV y JSON

### 5. Análisis y Estadísticas
- Métricas generales de los sensores
- Estadísticas de promedios, mínimos y máximos

## Características de Seguridad

- Autenticación JWT con expiración
- Contraseñas encriptadas con bcrypt
- Rate limiting en endpoints de API
- Validación de datos de entrada
- Headers de seguridad con Helmet
- CORS configurado

## Personalización

### Cambiar intervalos de actualización
Editar en `server.js`:
```javascript
// Cambiar de 5000ms (5 segundos) a otro valor
setInterval(broadcastSensorData, 5000);
```

### Modificar estilos
- Editar archivos CSS en `public/css/`
- Los colores principales están definidos como variables CSS

### Agregar nuevos sensores
1. Modificar la estructura de la base de datos
2. Actualizar modelos en `src/models/`
3. Agregar endpoints en controladores y rutas
4. Actualizar frontend para mostrar nuevos datos

## Solución de Problemas

### Error de conexión a la base de datos
- Verificar que XAMPP esté ejecutándose
- Comprobar credenciales en `.env`
- Asegurar que la base de datos `sensores_db` existe

### Puerto ya en uso
- Cambiar el puerto en `.env`
- O terminar el proceso que usa el puerto 3000

### Problemas de CORS
- Verificar configuración de CORS en `server.js`
- Asegurar que el frontend accede desde el mismo dominio

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para soporte o consultas, contactar al desarrollador.

---

**Nota**: Este es un proyecto de demostración. Para uso en producción, asegurar de cambiar las claves secretas y implementar medidas de seguridad adicionales.

