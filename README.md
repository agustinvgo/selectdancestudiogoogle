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

<img width="1889" height="910" alt="Captura de pantalla 2026-04-16 173045" src="https://github.com/user-attachments/assets/41233660-83d2-4dcc-a499-733f79f7a6f4" />
<img width="761" height="909" alt="Captura de pantalla 2026-04-16 173130" src="https://github.com/user-attachments/assets/a4a3789c-7de4-4ce1-b696-19881ed05d7c" />
<img width="1896" height="912" alt="Captura de pantalla 2026-04-16 174015" src="https://github.com/user-attachments/assets/f6acda36-3bcc-47f6-9071-dd408cc94ca8" />

https://www.linkedin.com/in/agustin-vega-godoy-24179a390/
https://selectdancestudio.com/
