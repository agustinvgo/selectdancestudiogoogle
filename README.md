# 🎭 Select Dance Studio (SDS) - Sistema de Gestión Integral

Sistema completo de gestión para escuelas de danza con roles diferenciados (Administrador y Alumno/Padre), desarrollado con arquitectura full-stack moderna.

## 📋 Descripción del Proyecto

Select Dance Studio es un sistema web completo que permite a las escuelas de danza administrar eficientemente todos los aspectos de su operación:

- **Administradores**: Pueden gestionar alumnos, asistencias, pagos, eventos y cursos
- **Alumnos/Padres**: Pueden consultar sus datos, horarios, asistencias, pagos y eventos

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js** - Servidor y API REST
- **MySQL** - Base de datos relacional
- **JWT** (jsonwebtoken) - Autenticación y autorización
- **bcrypt** - Hash seguro de contraseñas
- **CORS** - Manejo de política de origen cruzado
- **dotenv** - Variables de entorno
- **express-validator** - Validación de datos

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework de estilos
- **Heroicons** - Iconos
- **Recharts** - Gráficos y visualizaciones

### Base de Datos
- **MySQL** con 10 tablas relacionadas
- Índices optimizados para consultas eficientes
- Relaciones con integridad referencial

## 📁 Estructura del Proyecto

```
select-dance-studio/
├── sds-backend/          # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/       # Configuración de BD
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── middlewares/  # Auth y validación
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Rutas de la API
│   │   └── index.js      # Servidor principal
│   ├── .env.example      # Variables de entorno
│   └── package.json
│
├── sds-frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── context/      # Context API (Auth)
│   │   ├── pages/        # Páginas principales
│   │   ├── services/     # API calls con Axios
│   │   ├── App.jsx       # Configuración de rutas
│   │   └── main.jsx      # Entry point
│   ├── .env.example      # Variables de entorno
│   └── package.json
│
├── schema.sql            # Script SQL completo
└── README.md             # Este archivo
```

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- **MySQL** (v8.0 o superior) - [Descargar](https://www.mysql.com/downloads/)
- **npm** o **yarn** (incluido con Node.js)
- Un editor de código (recomendado: VS Code)

## 🛠️ Instalación y Configuración

### 1️⃣ Clonar o Descargar el Proyecto

Si tienes el proyecto en un repositorio:
```bash
git clone <url-del-repositorio>
cd selectdancestudiogoogle
```

### 2️⃣ Configurar la Base de Datos

1. **Inicia MySQL** en tu sistema local o servidor

2. **Ejecuta el script SQL**:
   ```bash
   # Opción 1: Desde la línea de comandos
   mysql -u root -p < schema.sql

   # Opción 2: Desde MySQL Workbench o phpMyAdmin
   # Abre el archivo schema.sql y ejecuta todo el contenido
   ```

3. **Verifica que la base de datos se creó correctamente**:
   ```sql
   USE select_dance_db;
   SHOW TABLES;
   SELECT * FROM usuarios;
   ```

### 3️⃣ Configurar el Backend

1. **Navega a la carpeta del backend**:
   ```bash
   cd sds-backend
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   # Copia el archivo de ejemplo
   copy .env.example .env    # En Windows
   # cp .env.example .env    # En Linux/Mac
   ```

4. **Edita el archivo `.env`** y configura tus credenciales:
   ```env
   PORT=5000
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password_mysql
   DB_NAME=select_dance_db
   
   JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion
   JWT_EXPIRES_IN=7d
   
   FRONTEND_URL=http://localhost:5173
   ```

5. **Inicia el servidor**:
   ```bash
   # Modo desarrollo (con auto-reload)
   npm run dev

   # Modo producción
   npm start
   ```

6. **Verifica que el servidor esté corriendo**:
   - Deberías ver: `✅ Conexión exitosa a MySQL`
   - El servidor estará en: `http://localhost:5000`

### 4️⃣ Configurar el Frontend

1. **Abre una nueva terminal** y navega a la carpeta del frontend:
   ```bash
   cd sds-frontend
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   copy .env.example .env    # En Windows
   # cp .env.example .env    # En Linux/Mac
   ```

4. **Edita el archivo `.env`**:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Inicia la aplicación**:
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**:
   - La aplicación estará en: `http://localhost:5173`

## 🔐 Usuarios de Prueba

El sistema viene con usuarios de ejemplo precargados:

### Administrador
- **Email**: admin@sds.com
- **Contraseña**: admin123

### Alumnos
- **Email**: alumno1@sds.com | **Contraseña**: alumno123
- **Email**: alumno2@sds.com | **Contraseña**: alumno123
- **Email**: maria.gonzalez@sds.com | **Contraseña**: alumno123

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (requiere auth)
- `GET /api/auth/me` - Obtener usuario actual

### Alumnos
- `GET /api/alumnos` - Listar todos (admin only)
- `GET /api/alumnos/:id` - Obtener alumno
- `GET /api/alumnos/:id/ficha-completa` - Ficha completa
- `POST /api/alumnos` - Crear alumno (admin only)
- `PUT /api/alumnos/:id` - Actualizar alumno (admin only)
- `DELETE /api/alumnos/:id` - Eliminar alumno (admin only)

### Asistencias
- `GET /api/asistencias/alumno/:id` - Asistencias de alumno
- `GET /api/asistencias/curso/:id` - Lista de asistencia de curso (admin only)
- `POST /api/asistencias` - Marcar asistencia (admin only)
- `POST /api/asistencias/masivas` - Marcar múltiples (admin only)

### Pagos
- `GET /api/pagos` - Todos los pagos (admin only)
- `GET /api/pagos/alumno/:id` - Pagos de alumno
- `GET /api/pagos/pendientes` - Pagos pendientes (admin only)
- `GET /api/pagos/estado-financiero` - Resumen financiero (admin only)
- `POST /api/pagos` - Crear pago (admin only)
- `PUT /api/pagos/:id` - Actualizar pago

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Detalle de evento
- `GET /api/eventos/alumno/:id` - Eventos de alumno
- `GET /api/eventos/proximos` - Próximos eventos
- `POST /api/eventos` - Crear evento (admin only)
- `POST /api/eventos/:id/inscribir` - Inscribir alumno (admin only)
- `PUT /api/eventos/inscripcion/:id/checklist` - Actualizar checklist

### Cursos
- `GET /api/eventos/cursos` - Listar cursos
- `GET /api/eventos/cursos/alumno/:id` - Cursos de alumno
- `POST /api/eventos/cursos` - Crear curso (admin only)
- `POST /api/eventos/cursos/:id/inscribir` - Inscribir alumno (admin only)

## 🎨 Características del Sistema

### Para Administradores
✅ Dashboard con estadísticas en tiempo real  
✅ Gestión completa de alumnos (CRUD)  
✅ Control de asistencias por curso y fecha  
✅ Gestión de pagos y estado financiero  
✅ Administración de eventos y competencias  
✅ Gráficos de ingresos mensuales  
✅ Sistema de notificaciones  

### Para Alumnos/Padres
✅ Dashboard personalizado  
✅ Vista de horarios y clases inscritas  
✅ Historial de asistencias con estadísticas  
✅ Estado de pagos y comprobantes  
✅ Próximos eventos con detalles  
✅ Instrucciones de vestuario/maquillaje/peinado  

### Características Técnicas
✅ Autenticación segura con JWT  
✅ Protección de rutas por roles  
✅ Validación de datos en backend  
✅ Interfaz responsive (móvil, tablet, desktop)  
✅ Diseño moderno con Tailwind CSS  
✅ Manejo global de errores  
✅ API RESTful bien documentada  

## 🏗️ Estructura de la Base de Datos

### Tablas Principales

1. **usuarios** - Credenciales y roles
2. **alumnos** - Información personal completa
3. **cursos** - Disciplinas/clases disponibles
4. **inscripciones_curso** - Relación alumnos-cursos
5. **asistencias** - Registro de asistencia
6. **pagos** - Historial financiero
7. **eventos** - Competencias y presentaciones
8. **inscripciones_evento** - Relación alumnos-eventos
9. **uniformes** - Control de talles y entrega
10. **notificaciones** - Comunicación escuela-padres

## 🚀 Despliegue en Producción

### Backend (Node.js)

1. **Configurar variables de entorno** en tu servidor:
   - `NODE_ENV=production`
   - Cambiar `JWT_SECRET` a un valor seguro y único
   - Configurar credenciales de MySQL del servidor

2. **Opciones de deploy**:
   - **Heroku**: `git push heroku main`
   - **DigitalOcean**: PM2 + Nginx
   - **AWS EC2**: PM2 + Nginx
   - **Vercel/Railway**: Deployment automático

3. **Instalar PM2** para mantener el proceso activo:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name sds-backend
   pm2 save
   pm2 startup
   ```

### Frontend (React)

1. **Actualizar la URL de la API** en `.env`:
   ```env
   VITE_API_URL=https://tu-api.com/api
   ```

2. **Generar build de producción**:
   ```bash
   npm run build
   ```

3. **Opciones de deploy**:
   - **Vercel**: Deployment automático desde GitHub
   - **Netlify**: Drag & drop de la carpeta `dist`
   - **Nginx**: Servir la carpeta `dist`

### Base de Datos

- Usar MySQL en un servidor dedicado o servicio cloud (AWS RDS, DigitalOcean Managed DB)
- Configurar backups automáticos
- Habilitar SSL/TLS

## 🔧 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Comprueba las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `select_dance_db` exista

### Error 401 (No autorizado)
- Verifica que el token JWT sea válido
- Comprueba que el `JWT_SECRET` sea el mismo en backend

### CORS errors
- Asegúrate de que `FRONTEND_URL` en `.env` del backend coincida con la URL del frontend
- Verifica que CORS esté configurado correctamente en `src/index.js`

### Frontend no se conecta al backend
- Verifica que `VITE_API_URL` en el frontend apunte a la URL correcta del backend
- Comprueba que el backend esté corriendo
- Abre la consola del navegador para ver errores específicos

## 📝 Notas Adicionales

- Las contraseñas en la base de datos están hasheadas con bcrypt
- Los tokens JWT exp iran después de 7 días por defecto
- El sistema usa soft delete para alumnos (no los elimina físicamente)
- Todas las fechas están en formato ISO (YYYY-MM-DD)
- Los montos de pagos son en formato decimal (10,2)

## 👥 Créditos

Desarrollado para **Select Dance Studio**  
Sistema de gestión integral v1.0.0

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para Select Dance Studio.

---

**¿Necesitas ayuda?** Consulta la documentación de cada tecnología:
- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
