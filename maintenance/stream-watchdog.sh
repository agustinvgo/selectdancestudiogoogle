#!/bin/sh

# Recupera MediaMTX cuando la cámara sigue conectada pero el manifiesto HLS
# deja de generarse. Está diseñado para ejecutarse mediante systemd cada 30 s.

set -u

STATE_DIR="/run/sds-stream-watchdog"
FAILURE_FILE="$STATE_DIR/failures"
LAST_RESTART_FILE="$STATE_DIR/last-restart"
MAX_FAILURES=3
RESTART_COOLDOWN_SECONDS=300

mkdir -p "$STATE_DIR"

log_message() {
    logger -t sds-stream-watchdog "$1"
    printf '%s\n' "$1"
}

write_number() {
    printf '%s\n' "$2" > "$1"
}

read_number() {
    value="0"
    if [ -r "$1" ]; then
        value="$(cat "$1" 2>/dev/null)"
    fi
    case "$value" in
        ''|*[!0-9]*) value="0" ;;
    esac
    printf '%s\n' "$value"
}

reset_failures() {
    write_number "$FAILURE_FILE" "0"
}

# Docker ya reinicia automáticamente el contenedor si el proceso se cae.
# Este watchdog cubre el caso distinto en que MediaMTX sigue "Up", pero HLS da 500.
if [ "$(docker inspect -f '{{.State.Running}}' sds-mediamtx 2>/dev/null)" != "true" ]; then
    log_message "MediaMTX no está ejecutándose; Docker gestionará su política de reinicio."
    exit 0
fi

if [ "$(docker inspect -f '{{.State.Running}}' sds-backend 2>/dev/null)" != "true" ] ||
   [ "$(docker inspect -f '{{.State.Running}}' sds-frontend 2>/dev/null)" != "true" ]; then
    log_message "Backend o frontend no disponibles; se omite la comprobación HLS."
    exit 0
fi

# Salida 0: la cámara está online.
# Salida 10: la cámara está desconectada (no reiniciar).
# Salida 11: no se pudo consultar la API (se considera fallo técnico).
docker exec sds-backend node -e "
fetch('http://mediamtx:9997/v3/paths/list', { signal: AbortSignal.timeout(5000) })
  .then(async (response) => {
    if (!response.ok) process.exit(11);
    const data = await response.json();
    const stream = (data.items || []).find((item) => item.name === 'live/estudio');
    process.exit(stream && stream.ready ? 0 : 10);
  })
  .catch(() => process.exit(11));
" >/dev/null 2>&1
camera_status="$?"

if [ "$camera_status" -eq 10 ]; then
    reset_failures
    exit 0
fi

if [ "$camera_status" -eq 0 ] &&
   docker exec sds-frontend wget -q -T 8 -t 1 -O /dev/null \
       "http://mediamtx:8888/live/estudio/index.m3u8" >/dev/null 2>&1; then
    reset_failures
    exit 0
fi

failures="$(read_number "$FAILURE_FILE")"
failures=$((failures + 1))
write_number "$FAILURE_FILE" "$failures"
log_message "Fallo HLS consecutivo ${failures}/${MAX_FAILURES}."

if [ "$failures" -lt "$MAX_FAILURES" ]; then
    exit 0
fi

now="$(date +%s)"
last_restart="$(read_number "$LAST_RESTART_FILE")"
elapsed=$((now - last_restart))

if [ "$last_restart" -gt 0 ] && [ "$elapsed" -lt "$RESTART_COOLDOWN_SECONDS" ]; then
    reset_failures
    log_message "Reinicio omitido: período de seguridad de 5 minutos activo."
    exit 0
fi

log_message "HLS falló ${MAX_FAILURES} veces; reiniciando sds-mediamtx."
if docker restart sds-mediamtx >/dev/null; then
    write_number "$LAST_RESTART_FILE" "$now"
    reset_failures
    log_message "MediaMTX reiniciado automáticamente."
    exit 0
fi

log_message "No se pudo reiniciar MediaMTX."
exit 1
