#!/bin/sh

set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

install -m 0755 "$SCRIPT_DIR/stream-watchdog.sh" /usr/local/sbin/sds-stream-watchdog
install -m 0644 "$SCRIPT_DIR/sds-stream-watchdog.service" /etc/systemd/system/sds-stream-watchdog.service
install -m 0644 "$SCRIPT_DIR/sds-stream-watchdog.timer" /etc/systemd/system/sds-stream-watchdog.timer

systemctl daemon-reload
systemctl enable --now sds-stream-watchdog.timer
systemctl start sds-stream-watchdog.service

echo "Watchdog instalado."
systemctl --no-pager status sds-stream-watchdog.timer
