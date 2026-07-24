# Transmisión en vivo — Guía de despliegue (VPS)

> **Actualización:** El sistema ahora usa una **cámara IP Oryx/YCC365Plus** con pull RTSP automático
> en vez de celular con push RTMP. MediaMTX se conecta a la cámara solo — no hay nada que configurar
> en la cámara misma.

Cómo poner en producción la transmisión en vivo de clases. **Nada de esto está deployado todavía** — es la guía para hacerlo cuando se decida.

## Qué se agregó

| Componente | Archivo |
|---|---|
| Servidor de medios (MediaMTX) | `mediamtx/mediamtx.yml`, servicio en `docker-compose.yml` |
| Video protegido por nginx | `sds-frontend/nginx.conf` (bloque `/live` + `auth_request`) |
| Endpoint de autorización | `sds-backend/.../transmisiones.controller.js` → `authorizeRead` |
| Página del alumno / admin | `EnVivo.jsx`, `Transmisiones.jsx`, aviso en `AlumnoDashboard.jsx` |
| Tabla | `sds-backend/migrations/create_transmisiones_table.sql` |

## Arquitectura y seguridad

```
Cámara/celular (estudio) --RTMP+contraseña--> :1935 MediaMTX (VPS)
                                                  |  (red interna Docker)
Padres (portal HTTPS) <--nginx /live + auth_request-- HLS :8888
                          nginx pregunta al backend si el padre tiene clase en vivo
```

- **Candado 1 — publicación:** solo el puerto **1935** es público, y publicar requiere usuario `camara` + contraseña. Nadie más puede pisar la transmisión.
- **Candado 2 — lectura:** el HLS (8888) y la API (9997) **no se exponen**; solo los alcanza nginx/backend por la red interna. nginx consulta al backend (`auth_request`) antes de servir cada pedido: solo un padre con clase en vivo (o admin) recibe el video.

## Pasos en el VPS

### 1. Variables de entorno (en el `.env` del VPS, NO se commitea)
```env
# Contraseña de publicación de la cámara (elegí una fuerte)
MEDIAMTX_PUBLISH_PASS=<contraseña-larga-y-secreta>
# Dirección pública RTMP a la que apunta la cámara (dominio o IP del VPS)
MEDIAMTX_RTMP_BASE=rtmp://selectdancestudio.com:1935
```

### 2. Firewall del VPS
Abrir el puerto **1935/tcp** entrante (para que la cámara del estudio publique):
```bash
ufw allow 1935/tcp
```

### 3. Deploy
```bash
cd /var/www/select-dance-studio
git pull
docker compose up -d --build
```
(o correr `deploy-vps.sh`)

### 4. Configurar la cámara/celular
En el panel **Admin → Transmisiones** aparece la URL exacta (con usuario y contraseña ya incluidos), algo como:
```
rtmp://camara:<contraseña>@selectdancestudio.com:1935/live/estudio
```
Se configura **una sola vez** en la app del celular (o la cámara). Recomendado: pantalla siempre encendida + auto-reconexión + enchufado.

## Verificación post-deploy
- [ ] `docker ps` muestra `sds-mediamtx` arriba.
- [ ] La cámara publica sin error (log: `docker logs sds-mediamtx`).
- [ ] Publicar SIN contraseña es rechazado.
- [ ] Un padre inscripto, durante el horario de la clase, ve el video en el portal.
- [ ] Un padre NO inscripto ve "no hay clase en vivo".
- [ ] Abrir `https://selectdancestudio.com/live/estudio/index.m3u8` **sin sesión** debe dar 401/403.

## ⚠️ Antes de transmitir menores (obligatorio)
Conseguir **consentimiento firmado de todas las familias** cuyos hijos aparezcan en cámara (Ley 25.326 / derecho de imagen). No es código, pero es requisito para operar.
