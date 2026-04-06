# Select Dance Studio - Sistema de Gestión

Sistema integral para la gestión de alumnos, cursos, asistencias y pagos para **Select Dance Studio**.
Incluye una página web pública moderna y un panel de administración completo.

## 🚀 Tecnologías

*   **Frontend**: React, Vite, TailwindCSS.
*   **Backend**: Node.js, Express, MySQL.
*   **Integraciones**: WhatsApp (Twilio/WPPConnect), MercadoPago, Email (Nodemailer).

## 📂 Estructura del Proyecto

El proyecto está dividido en dos carpetas principales:

*   **`sds-frontend/`**: La aplicación web (Interfaz de usuario).
    *   `src/pages/admin/`: Panel de control (Alumnos, Pagos, Cursos).
    *   `src/pages/public/`: Web pública (Home, Cursos, Contacto).
    *   `src/pages/alumno/`: Portal del alumno.
*   **`sds-backend/`**: La API del servidor.
    *   `src/controllers/`: Lógica de negocio agrupada (`admin/`, `public/`).
    *   `src/routes/`: Rutas de la API.
    *   `src/models/`: Consultas SQL.

## 🛠️ Instalación y Ejecución

### 1. Base de Datos
Importa el archivo `schema.sql` en tu servidor MySQL para crear las tablas necesarias.

### 2. Backend (Servidor)
```bash
cd sds-backend
npm install
# Crear archivo .env basado en .env.example
npm run dev
```
El servidor correrá en `http://localhost:5000`.

### 3. Frontend (Web)
```bash
cd sds-frontend
npm install
npm run dev
```
La web estará disponible en `http://localhost:5173`.

## ✨ Funcionalidades Principales

*   **Gestión de Alumnos**: Alta, baja, modificación y fichas médicas.
*   **Control de Asistencias**: Registro diario por curso.
*   **Pagos y Finanzas**: Control de mensualidades, recibos PDF y reportes de caja.
*   **Clases de Prueba**: Sistema de reserva de vacantes online.
*   **Tienda**: Catálogo de uniformes y productos.
*   **Notificaciones**: Recordatorios automáticos por Email y WhatsApp.

---
Desarrollado para Select Dance Studio.
