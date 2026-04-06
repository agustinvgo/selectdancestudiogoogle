# Select Dance Studio - Gestión y Plataforma Web

Bienvenido al repositorio principal de la plataforma **Select Dance Studio (SDS)**. Este sistema es una plataforma integral (Full Stack) diseñada para administrar una academia de danza, facilitando tanto la operación interna del equipo de administración como la experiencia de los alumnos.

## 🚀 Arquitectura y Tecnologías (Stack)

El proyecto está dividido principalmente en dos módulos grandes: el Frontend (interfaz de usuario) y el Backend (lógica de negocio y base de datos).

### Frontend (`/sds-frontend`)
Desarrollado como una Single Page Application (SPA) ultrarrápida:
* **Core**: React 18 impulsado por Vite.
* **Estilos**: Tailwind CSS 3.
* **Manejo de Rutas**: React Router DOM.
* **Componentes Clave**:
  * `recharts` para gráficos de analíticas financieras.
  * `react-big-calendar` para la gestión visual del calendario de clases.
  * Autenticación basada en Context API.

### Backend (`/sds-backend`)
Una API RESTful robusta y segura:
* **Core**: Node.js + Express.js.
* **Base de Datos**: MySQL (manejado vía queries nativas con `mysql2` para máxima performance).
* **Seguridad integral**: Encriptación con `bcrypt`/`bcryptjs`, control de sesiones con JSON Web Tokens (`jsonwebtoken`).
* **Utilidades**: `nodemailer` para comunicaciones automáticas y notificaciones, y `pdfkit` para generación de recibos/comprobantes dinámicos.

---

## 📂 Estructura del Proyecto

```text
/selectdancestudiogoogle
├── sds-frontend/         # Todo el código fuente en React de la App.
│   ├── src/
│   │   ├── components/   # Componentes reusables (Navbar, Cards, Modales).
│   │   ├── pages/        # Vistas principales (Alumnos, Admin, Calendario).
│   │   ├── services/     # Llamadas a la API usando Axios.
│   │   ...
├── sds-backend/          # Código fuente del Servidor Node.
│   ├── src/
│   │   ├── controllers/  # Lógica central (Auth, Pagos, Alumnos).
│   │   ├── routes/       # Definición de Endpoints REST.
│   │   ├── middlewares/  # Controladores de subida de imágenes, validadores y seguridad por JWT.
│   │   ...
├── schema.sql            # Estructura principal de la Base de Datos MySQL.
├── Dockerfile            # Configuración de contenedores (para despliegue Prod).
├── docker-compose.yml    # Orquestación de infraestructura.
└── *.py                  # Distintos Scripts de Mantenimiento y Operaciones (revisar sección DevOps)
```

---

## 🛠️ Levantamiento del Entorno de Desarrollo (Local)

Para correr este ecosistema en tu máquina, sigue los próximos pasos:

### 1. Base de datos
Necesitas una base de datos MySQL local (por ejemplo usando XAMPP o Docker).
Importa el archivo `schema.sql` ubicado en la raíz del proyecto para generar las tablas maestras.

### 2. Variables de Entorno
Debes crear un archivo `.env` tanto en `/sds-backend` como en `/sds-frontend` basados en sus repectivos `.env.example` (si existen) o configurar:
* En el backend: Datos de conexión a MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`), la semilla de firmas (`JWT_SECRET`) y credenciales para Nodemailer.
* En el frontend: Apuntar la `VITE_API_URL` a `http://localhost:3000/api`.

### 3. Instalación de Dependencias
Abre **dos** consolas de comando independientes:

**Consola 1: Backend**
```bash
cd sds-backend
npm install
npm run dev
```

**Consola 2: Frontend**
```bash
cd sds-frontend
npm install
npm run dev
```
La consola del frontend te indicará un enlace (por ej: `http://localhost:5173`) donde podrás visualizar y probar la aplicación web localmente en tiempo real.

---

## ⚙️ DevOps: Scripts de Mantenimiento y Producción

A lo largo del desarrollo, hemos incorporado scripts utilitarios en Python que residen en la raíz del proyecto. Estos scripts son fundamentales para diagnosticar y ejecutar tareas complejas de optimización directo en el servidor **VPS Hostinger de Producción**.

* **`diag_vps.py`**: Utilidad de diagnóstico general. Se conecta por SSH al servidor VPS, lista los contenedores de Docker activos, audita el sub-directorio `/var/www/select-dance-studio`, y extrae la configuración de Nginx y `docker-compose.yml`. Muy útil si el sitio se cae y necesitas ver el status rápido.
* **`optimize_hof.py`**: Toma las imágenes locales almacenadas en el directorio estático del frontend (`/dist/hof`), las intercepta con la librería `Pillow`, restringe su tamaño a 800 pixeles de máximo, y las reconvierte a `.webp` de compresión alta. Es el salvavidas del ancho de banda visual.
* **`fix_hof_images.py`**: Tras usar `optimize_hof.py`, este script se conecta vía SSH al Hostinger, crea un túnel SFTP, sube las imágenes WebP optimizadas a una carpeta temporal, y mediante un comando de `docker cp` las inyecta en vivo dentro del contenedor `sds-frontend` en `/usr/share/nginx/html/hof/` (sin necesidad de reconstruir toda la imagen de Docker ni generar tiempos de inactividad).

### Consideraciones sobre Docker en Producción
El servidor ejecuta la red usando `docker-compose.yml`, orquestando contenedores para el `backend`, `frontend`, la base de datos MySQL y el Reverse Proxy **Nginx**. Si alguna vez requieres aplicar cambios profundos, los comandos remotos clásicos son:
```bash
docker compose pull
docker compose up -d --build
```
Evita tocar contenedores manualmente sin antes comprender la red creada por Docker Compose.
