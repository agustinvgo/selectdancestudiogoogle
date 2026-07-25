import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hls from 'hls.js';
import { transmisionesAPI } from '../../services/api';
import { VideoCameraIcon, SignalIcon } from '@heroicons/react/24/outline';

// Reproductor HLS reutilizable (usa hls.js; en Safari usa el player nativo)
const HlsPlayer = ({ src }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        // IMPORTANTE: setear la PROPIEDAD muted (React no lo hace confiable vía atributo).
        // Sin esto el navegador cree que hay audio y bloquea el autoplay -> queda gris.
        video.muted = true;
        const tryPlay = () => video.play().catch(() => { /* si igual se bloquea, el usuario toca play */ });

        // Safari / iOS reproducen HLS de forma nativa
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', tryPlay, { once: true });
            return;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                liveDurationInfinity: true,
                lowLatencyMode: false,
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 15,
                levelLoadingTimeOut: 10000,
                levelLoadingMaxRetry: 15,
                fragLoadingTimeOut: 20000,
                fragLoadingMaxRetry: 15,
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);

            // Autorrecuperación transparente si hay microcortes durante transmisiones de >1 hora
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn('[HLS] Microcorte de red detectado, reconectando...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn('[HLS] Fallo en buffer de video, recuperando...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('[HLS] Reiniciando reproductor...');
                            hls.destroy();
                            break;
                    }
                }
            });

            // Helper: saltar al borde en vivo y reanudar
            const syncToLive = () => {
                hls.startLoad();
                // Esperamos al próximo fragmento para tener liveSyncPosition disponible
                hls.once(Hls.Events.FRAG_BUFFERED, () => {
                    const edge = hls.liveSyncPosition;
                    if (edge && isFinite(edge)) video.currentTime = edge;
                    video.play().catch(() => {});
                });
                video.play().catch(() => {});
            };

            // Fix 1: cuando el usuario vuelve a la pestaña (PC o móvil)
            const handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    console.log('[HLS] Pestaña activa → resincronizando al vivo...');
                    syncToLive();
                }
            };
            document.addEventListener('visibilitychange', handleVisibility);

            // Fix 2: detector de video congelado (cubre el caso PC sin cambio de pestaña)
            // Cada 5 segundos verifica si currentTime avanzó.
            // Si no avanzó 2 veces seguidas (~10 seg) y el video debería correr → resincroniza.
            let lastTime = -1;
            let staleCount = 0;
            const staleChecker = setInterval(() => {
                // No chequear si la pestaña está oculta (visibilitychange lo cubre)
                // o si el video está pausado intencionalmente por el usuario
                if (document.hidden) return;
                if (video.currentTime === lastTime && !video.paused) {
                    staleCount++;
                    if (staleCount >= 2) {
                        console.warn('[HLS] Video congelado detectado → resincronizando al vivo...');
                        syncToLive();
                        staleCount = 0;
                    }
                } else {
                    staleCount = 0;
                }
                lastTime = video.currentTime;
            }, 5000);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibility);
                clearInterval(staleChecker);
                hls.destroy();
            };
        }

    }, [src]);

    return (
        <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain bg-black"
        />
    );
};

const EnVivo = () => {
    const [now, setNow] = useState(Date.now());

    // Poll cada 10s para detectar inicio/fin de la transmisión
    const { data } = useQuery({
        queryKey: ['transmision-en-vivo'],
        queryFn: async () => (await transmisionesAPI.enVivo()).data,
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const estado = data?.estado;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <VideoCameraIcon className="h-8 w-8 text-red-500" />
                    Clase en Vivo
                </h1>
                <p className="text-gray-500 mt-1">Mirá la clase de tu hijo/a en tiempo real.</p>
            </div>

            {estado === 'en_vivo' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            En vivo
                        </span>
                        <span className="text-gray-700 font-semibold">{data.curso?.nombre}</span>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-gray-200 aspect-video bg-black shadow-lg">
                        <HlsPlayer src={data.hlsUrl} />
                    </div>
                    <p className="text-xs text-gray-400">
                        Si el video se corta unos segundos, es normal: se está transmitiendo en tiempo real.
                    </p>
                </div>
            )}

            {estado === 'esperando' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
                    <SignalIcon className="h-12 w-12 mx-auto text-amber-500 mb-4 animate-pulse" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">La transmisión está por comenzar</h3>
                    <p className="text-gray-600 text-sm">
                        {data.curso?.nombre} — esperando que la cámara se conecte…
                    </p>
                </div>
            )}

            {estado === 'offline' && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
                    <VideoCameraIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No hay ninguna clase en vivo ahora</h3>
                    <p className="text-gray-500 text-sm">
                        Cuando empiece una clase de tu hijo/a, vas a poder verla desde acá.
                    </p>
                </div>
            )}

            {!estado && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-400">
                    Cargando…
                </div>
            )}
        </div>
    );
};

export default EnVivo;
