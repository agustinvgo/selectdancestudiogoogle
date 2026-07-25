const db = require('../config/db');

// Configuración del servidor de medios (MediaMTX). En dev apunta a la PC local;
// en producción se setean estas vars al servicio/red del VPS.
const RTMP_BASE = process.env.MEDIAMTX_RTMP_BASE || 'rtmp://192.168.100.21:1935';
const API_URL = process.env.MEDIAMTX_API_URL || 'http://localhost:9997';



// Normaliza para comparar días sin depender de acentos/mayúsculas
// (ej: "Miércoles" y "Miercoles" quedan iguales)
const norm = (s) => (s || '').toString().trim().toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u');

// UNA sola cámara para todo el estudio: un único stream fijo.
// La cámara empuja siempre a este path; el horario decide qué curso está al aire.
// (dos segmentos porque los encoders RTMP exigen app/stream)
const STREAM_KEY = process.env.MEDIAMTX_STREAM_KEY || 'live/estudio';
function streamKey() { return STREAM_KEY; }
// Embebido en el portal: relativo, mismo origen (proxy Vite/nginx -> MediaMTX).
// Así se evita CORS + cookies de terceros que bloquean navegadores como Edge.
function hlsUrl(key) { return `/${key}/index.m3u8`; }
// Player propio de MediaMTX (para "Ver" del admin): también relativo, vía el mismo proxy.
function playerUrl(key) { return `/${key}/`; }
// URL para configurar la cámara. Incluye usuario:contraseña si hay auth de publicación (producción).
function rtmpUrl(key) {
    const u = process.env.MEDIAMTX_PUBLISH_USER;
    const p = process.env.MEDIAMTX_PUBLISH_PASS;
    if (u && p) {
        const withCreds = RTMP_BASE.replace(/^rtmp:\/\//, `rtmp://${encodeURIComponent(u)}:${encodeURIComponent(p)}@`);
        return `${withCreds}/${key}`;
    }
    return `${RTMP_BASE}/${key}`;
}

// ¿El curso está dentro de su ventana horaria ahora mismo? (siempre en hora de Buenos Aires)
function dentroDeHorario(curso, now = new Date()) {
    if (!curso.dia_semana || !curso.hora_inicio || !curso.hora_fin) return false;

    // Obtener partes de fecha/hora en la timezone de Buenos Aires
    // (independientemente del timezone del servidor/VPS)
    const TZ = 'America/Argentina/Buenos_Aires';
    const parts = new Intl.DateTimeFormat('es-AR', {
        timeZone: TZ,
        weekday: 'long',   // ej: "lunes", "martes"...
        hour:    '2-digit',
        minute:  '2-digit',
        second:  '2-digit',
        hour12:  false,
    }).formatToParts(now);

    const get = (type) => parts.find(p => p.type === type)?.value ?? '';

    // Día de la semana en español, normalizado (sin acentos, minúsculas)
    const diaBa   = norm(get('weekday'));

    // Hora como "HH:MM:SS"
    const hhmmss  = `${get('hour').padStart(2, '0')}:${get('minute').padStart(2, '0')}:${get('second').padStart(2, '0')}`;

    if (norm(curso.dia_semana) !== diaBa) return false;
    return curso.hora_inicio <= hhmmss && hhmmss <= curso.hora_fin;
}

// ¿MediaMTX está recibiendo video en ese path? (API v3)
async function hayPublisher(key) {
    try {
        const res = await fetch(`${API_URL}/v3/paths/list`, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) return false;
        const data = await res.json();
        const item = (data.items || []).find(p => p.name === key);
        return !!(item && item.ready);
    } catch {
        return false; // Si MediaMTX no responde, tratamos como "sin video"
    }
}

async function getManual(cursoId) {
    const [rows] = await db.query('SELECT manual_activo FROM transmisiones WHERE curso_id = ?', [cursoId]);
    return rows.length ? !!rows[0].manual_activo : false;
}

async function setManual(cursoId, activo) {
    const key = streamKey();
    await db.query(
        `INSERT INTO transmisiones (curso_id, stream_key, manual_activo, inicio_at, fin_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            manual_activo = VALUES(manual_activo),
            inicio_at = IF(VALUES(manual_activo) = 1, NOW(), inicio_at),
            fin_at    = IF(VALUES(manual_activo) = 0, NOW(), fin_at)`,
        [cursoId, key, activo ? 1 : 0, activo ? new Date() : null, activo ? null : new Date()]
    );
}

/**
 * Estado completo de un curso:
 *  - 'en_vivo'   → debería estar al aire (manual u horario) Y hay video llegando
 *  - 'esperando' → debería estar al aire pero la cámara aún no transmite
 *  - 'offline'   → fuera de horario y sin override manual
 */
async function estadoCurso(curso) {
    const key = streamKey();
    const manual = await getManual(curso.id);
    const programada = manual || dentroDeHorario(curso);
    const video = programada ? await hayPublisher(key) : false;

    // Reglas:
    //  - Hay video (cámara prendida)  -> 'en_vivo'.
    //  - El admin lo inició MANUAL     -> 'esperando' (feedback: espera la cámara).
    //  - Solo por horario, sin cámara  -> 'offline' (día sin clase = no se muestra nada).
    let estado = 'offline';
    if (video) estado = 'en_vivo';
    else if (manual) estado = 'esperando';

    return { estado, programada, video, manual, streamKey: key, hlsUrl: hlsUrl(key), playerUrl: playerUrl(key), rtmpUrl: rtmpUrl(key) };
}

module.exports = { streamKey, hlsUrl, rtmpUrl, dentroDeHorario, hayPublisher, getManual, setManual, estadoCurso };
