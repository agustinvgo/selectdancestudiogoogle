const db = require('../config/db');

// Pausa de notificaciones AUTOMÁTICAS por canal.
// Se guarda en bot_config (clave-valor). '1' = pausado, cualquier otra cosa = activo.
// Los envíos MANUALES y los críticos (reset de contraseña) pasan { force: true } y se saltan la pausa.

const CLAVES = {
    wsp: 'notif_wsp_pausado',
    email: 'notif_email_pausado',
};

async function isPaused(canal) {
    const clave = CLAVES[canal];
    if (!clave) return false;
    try {
        const [rows] = await db.query('SELECT valor FROM bot_config WHERE clave = ?', [clave]);
        return rows[0]?.valor === '1';
    } catch {
        return false; // ante un error de DB, NO bloquear envíos
    }
}

async function getPausa() {
    try {
        const [rows] = await db.query(
            'SELECT clave, valor FROM bot_config WHERE clave IN (?, ?)',
            [CLAVES.wsp, CLAVES.email]
        );
        const m = Object.fromEntries(rows.map(r => [r.clave, r.valor]));
        return { wsp: m[CLAVES.wsp] === '1', email: m[CLAVES.email] === '1' };
    } catch {
        return { wsp: false, email: false };
    }
}

async function setPausa(canal, pausado) {
    const clave = CLAVES[canal];
    if (!clave) throw new Error('Canal inválido');
    const valor = pausado ? '1' : '0';
    await db.query(
        'INSERT INTO bot_config (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        [clave, valor, valor]
    );
}

module.exports = { isPaused, getPausa, setPausa };
