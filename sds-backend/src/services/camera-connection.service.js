const net = require('net');
const db = require('../config/db');
const {
    normalizeClientIp,
    isPublicIPv4,
    buildCameraSource,
    sourceHostname,
} = require('../utils/camera-network.utils');

const API_URL = process.env.MEDIAMTX_API_URL || 'http://localhost:9997';
const STREAM_KEY = process.env.MEDIAMTX_STREAM_KEY || 'live/estudio';
const CAMERA_PORT = Number(process.env.CAMERA_RTSP_PORT || 554);
const CAMERA_TEMPLATE = process.env.CAMERA_RTSP_URL || '';
const SYNC_INTERVAL_MS = 60 * 1000;

let syncTimer = null;
let reconnecting = false;

function serviceError(message, statusCode = 500, code = 'CAMERA_ERROR') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
}

function pathConfigUrl(action) {
    return `${API_URL}/v3/config/paths/${action}/${STREAM_KEY}`;
}

async function getMediaPathConfig() {
    const response = await fetch(pathConfigUrl('get'), {
        signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
        throw serviceError('El servidor de video no respondió correctamente', 502, 'MEDIAMTX_UNAVAILABLE');
    }

    return response.json();
}

async function patchMediaSource(source) {
    const response = await fetch(pathConfigUrl('patch'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
        signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
        throw serviceError('No se pudo actualizar el servidor de video', 502, 'MEDIAMTX_UPDATE_FAILED');
    }
}

async function isStreamReady() {
    const response = await fetch(`${API_URL}/v3/paths/list`, {
        signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;

    const data = await response.json();
    const path = (data.items || []).find((item) => item.name === STREAM_KEY);
    return !!path?.ready;
}

async function waitForStreamReady(timeoutMs = 22000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        if (await isStreamReady().catch(() => false)) return true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return false;
}

function probeCamera(ip, port = CAMERA_PORT, timeoutMs = 5000) {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host: ip, port });
        let settled = false;

        const finish = (reachable) => {
            if (settled) return;
            settled = true;
            socket.destroy();
            resolve(reachable);
        };

        socket.setTimeout(timeoutMs);
        socket.once('connect', () => finish(true));
        socket.once('timeout', () => finish(false));
        socket.once('error', () => finish(false));
    });
}

async function getSavedCameraIp() {
    const [rows] = await db.query('SELECT camera_ip, updated_at FROM stream_config WHERE id = 1 LIMIT 1');
    return rows[0] || null;
}

async function saveCameraIp(ip, userId) {
    await db.query(
        `INSERT INTO stream_config (id, camera_ip, updated_by)
         VALUES (1, ?, ?)
         ON DUPLICATE KEY UPDATE
            camera_ip = VALUES(camera_ip),
            updated_by = VALUES(updated_by),
            updated_at = CURRENT_TIMESTAMP`,
        [ip, userId || null]
    );
}

async function reconnectFromClientIp(clientIp, userId) {
    if (reconnecting) {
        throw serviceError('Ya hay una reconexión en curso. Esperá unos segundos.', 409, 'RECONNECT_IN_PROGRESS');
    }

    const ip = normalizeClientIp(clientIp);

    if (!isPublicIPv4(ip)) {
        throw serviceError(
            'No pudimos detectar una IPv4 pública. Conectate al Wi-Fi del estudio, desactivá los datos móviles e intentá nuevamente.',
            400,
            'INVALID_PUBLIC_IP'
        );
    }

    if (!CAMERA_TEMPLATE) {
        throw serviceError('Falta la configuración base de la cámara en el servidor', 503, 'CAMERA_TEMPLATE_MISSING');
    }

    reconnecting = true;
    let previousSource = null;

    try {
        const reachable = await probeCamera(ip);
        if (!reachable) {
            throw serviceError(
                'No encontramos la cámara en esta red. Verificá que estés usando el Wi-Fi del estudio, que la cámara esté encendida y que no haya una VPN o Relay activo.',
                422,
                'CAMERA_NOT_REACHABLE'
            );
        }

        const current = await getMediaPathConfig();
        previousSource = current.source || null;

        const source = buildCameraSource(ip, CAMERA_TEMPLATE);
        if (sourceHostname(previousSource) !== ip) {
            await patchMediaSource(source);
        }

        const ready = await waitForStreamReady();
        if (!ready) {
            if (previousSource && sourceHostname(previousSource) !== ip) {
                await patchMediaSource(previousSource).catch(() => {});
            }
            throw serviceError(
                'La red respondió, pero no pudimos recibir video. Revisá que la cámara esté encendida e intentá nuevamente.',
                422,
                'CAMERA_STREAM_NOT_READY'
            );
        }

        await saveCameraIp(ip, userId);
        return { ip, connected: true };
    } finally {
        reconnecting = false;
    }
}

async function getStatus(clientIp) {
    const detectedIp = normalizeClientIp(clientIp);
    const detectedIsPublic = isPublicIPv4(detectedIp);
    const saved = await getSavedCameraIp();

    let configuredIp = null;
    let videoReady = false;
    try {
        configuredIp = sourceHostname((await getMediaPathConfig()).source);
        videoReady = await isStreamReady();
    } catch {
        // El panel sigue funcionando aunque MediaMTX esté temporalmente caído.
    }

    return {
        detectedIp: detectedIsPublic ? detectedIp : null,
        savedIp: saved?.camera_ip || null,
        configuredIp: configuredIp || null,
        videoReady,
        sameNetwork: detectedIsPublic && !!saved?.camera_ip && detectedIp === saved.camera_ip,
        updatedAt: saved?.updated_at || null,
    };
}

async function restoreSavedCameraIp() {
    if (!CAMERA_TEMPLATE) return false;

    const saved = await getSavedCameraIp();
    if (!saved?.camera_ip || !isPublicIPv4(saved.camera_ip)) return false;

    const desiredSource = buildCameraSource(saved.camera_ip, CAMERA_TEMPLATE);
    const current = await getMediaPathConfig();
    if (current.source === desiredSource) return false;

    await patchMediaSource(desiredSource);
    console.log('[Cámara] Se restauró la última IP validada después del reinicio de MediaMTX');
    return true;
}

function initPersistence() {
    if (syncTimer || !CAMERA_TEMPLATE || process.env.NODE_ENV === 'test') return;

    const sync = () => restoreSavedCameraIp().catch((error) => {
        console.warn(`[Cámara] No se pudo sincronizar la configuración: ${error.message}`);
    });

    setTimeout(sync, 5000).unref();
    syncTimer = setInterval(sync, SYNC_INTERVAL_MS);
    syncTimer.unref();
}

function stopPersistence() {
    if (!syncTimer) return;
    clearInterval(syncTimer);
    syncTimer = null;
}

module.exports = {
    reconnectFromClientIp,
    getStatus,
    restoreSavedCameraIp,
    initPersistence,
    stopPersistence,
    probeCamera,
};
