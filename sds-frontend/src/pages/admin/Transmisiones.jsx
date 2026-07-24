import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transmisionesAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { VideoCameraIcon, PlayIcon, StopIcon, SignalIcon } from '@heroicons/react/24/solid';
import Loader from '../../components/Loader';

const EstadoBadge = ({ estado }) => {
    const map = {
        en_vivo: { txt: 'EN VIVO', cls: 'bg-red-600 text-white', dot: true },
        esperando: { txt: 'Esperando cámara', cls: 'bg-amber-100 text-amber-700' },
        offline: { txt: 'Offline', cls: 'bg-gray-100 text-gray-500' },
    };
    const s = map[estado] || map.offline;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${s.cls}`}>
            {s.dot && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            {s.txt}
        </span>
    );
};

const Transmisiones = () => {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['transmisiones-admin'],
        queryFn: async () => (await transmisionesAPI.listAdmin()).data.data,
        refetchInterval: 8000,
    });

    const iniciar = useMutation({
        mutationFn: (id) => transmisionesAPI.iniciar(id),
        onSuccess: () => { toast.success('Transmisión marcada EN VIVO'); qc.invalidateQueries({ queryKey: ['transmisiones-admin'] }); },
        onError: () => toast.error('No se pudo iniciar'),
    });
    const detener = useMutation({
        mutationFn: (id) => transmisionesAPI.detener(id),
        onSuccess: () => { toast.success('Transmisión detenida'); qc.invalidateQueries({ queryKey: ['transmisiones-admin'] }); },
        onError: () => toast.error('No se pudo detener'),
    });

    const copiar = (txt) => { navigator.clipboard?.writeText(txt); toast.success('Copiado'); };

    if (isLoading) return <Loader />;
    const cursos = data || [];
    const camUrl = cursos[0]?.rtmpUrl || '';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <VideoCameraIcon className="h-8 w-8 text-red-500" />
                    Transmisiones en Vivo
                </h1>
                <p className="text-gray-500 mt-1">
                    Cada curso emite durante su horario automáticamente. Podés forzar el inicio con el botón manual.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">📹 Cámara IP del Estudio Conectada</p>
                <p className="text-blue-700/90">
                    El servidor se conecta automáticamente a la cámara IP del estudio.
                    El sistema muestra de forma automática la clase que esté <strong>en horario</strong> a los padres inscriptos.
                </p>
            </div>

            <div className="space-y-3">
                {cursos.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-gray-900">{c.nombre}</h3>
                                <EstadoBadge estado={c.estado} />
                            </div>
                            <p className="text-xs text-gray-500">
                                {c.dia_semana} · {c.hora_inicio?.slice(0, 5)}–{c.hora_fin?.slice(0, 5)}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {c.manual ? (
                                <button
                                    onClick={() => detener.mutate(c.id)}
                                    disabled={detener.isPending}
                                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <StopIcon className="h-4 w-4" /> Detener
                                </button>
                            ) : (
                                <button
                                    onClick={() => iniciar.mutate(c.id)}
                                    disabled={iniciar.isPending}
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <PlayIcon className="h-4 w-4" /> Iniciar manual
                                </button>
                            )}
                            {c.estado === 'en_vivo' && (
                                <a
                                    href={c.playerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <SignalIcon className="h-4 w-4 text-red-500" /> Ver
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                {cursos.length === 0 && (
                    <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-gray-200">
                        No hay cursos activos.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transmisiones;
