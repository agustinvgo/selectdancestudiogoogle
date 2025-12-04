# 🔧 Cómo Reiniciar los Servidores

## Problema Resuelto
Todos los procesos de Node han sido detenidos. Ahora puedes escribir en las terminales nuevamente.

## Pasos para Reiniciar

### 1️⃣ Terminal 1 - Backend
```bash
cd c:\xampp\htdocs\selectdancestudiogoogle\sds-backend
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:5000
✅ Conexión exitosa a MySQL - Base de datos: select_dance_db
```

### 2️⃣ Terminal 2 - Frontend  
```bash
cd c:\xampp\htdocs\selectdancestudiogoogle\sds-frontend
npm run dev
```

Deberías ver:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

## ⚠️ Importante

- **Usa solo 2 terminales**: una para backend, otra para frontend
- Si necesitas ejecutar comandos, abre una **tercera terminal** nueva
- Para detener un servidor: presiona `Ctrl + C` en la terminal

## Si vuelve a bloquearse

Ejecuta en PowerShell:
```powershell
Stop-Process -Name node -Force
```

Luego reinicia normalmente.
