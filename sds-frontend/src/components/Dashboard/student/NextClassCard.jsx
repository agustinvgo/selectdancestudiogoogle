import { ClockIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/outline';

const NextClassCard = ({ cursos }) => {
    // Lógica para encontrar la próxima clase más cercana
    const getNextClass = () => {
        if (!cursos || cursos.length === 0) return null;

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoyDia = new Date().getDay(); // 0-6
        const hoyHora = new Date().getHours() * 60 + new Date().getMinutes();

        // Mapear días a números para comparar
        const mapaDias = {
            'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6
        };

        // Encontrar la próxima clase
        // Simplificado: Buscamos la primera clase que sea hoy más tarde, o el día más cercano
        const cursosOrdenados = [...cursos].map(c => {
            const diaNum = mapaDias[c.dia_semana];
            const [h, m] = c.hora_inicio.split(':');
            const horaInicioMin = parseInt(h) * 60 + parseInt(m);

            let diffDias = diaNum - hoyDia;
            if (diffDias < 0) diffDias += 7; // Es la próxima semana
            if (diffDias === 0 && horaInicioMin < hoyHora) diffDias += 7; // Ya pasó hoy, es la próxima semana

            return { ...c, diffDias, horaInicioMin };
        }).sort((a, b) => {
            if (a.diffDias !== b.diffDias) return a.diffDias - b.diffDias;
            return a.horaInicioMin - b.horaInicioMin;
        });

        return cursosOrdenados[0];
    };

    const nextClass = getNextClass();

    if (!nextClass) {
        return (
            <div className="card bg-gradient-to-r from-slate-800 to-slate-900 border-l-4 border-l-blue-500">
                <div className="card-body flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">No tienes clases próximas</h3>
                        <p className="text-slate-400 text-sm">Inscríbete en cursos para verlos aquí</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-gradient-to-r from-blue-900/40 to-slate-900 border-l-4 border-l-blue-500 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 h-full w-32 bg-blue-500/5 skew-x-12 transform translate-x-16"></div>

            <div className="card-body relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 block">
                            Tu Próxima Clase
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{nextClass.nombre}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                {nextClass.dia_semana} {nextClass.hora_inicio.substring(0, 5)}
                            </span>
                            {nextClass.profesor && (
                                <span className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4" />
                                    {nextClass.profesor}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="inline-flex flex-col items-center justify-center bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 min-w-[80px]">
                            <span className="text-xs text-blue-300 font-medium uppercase">Nivel</span>
                            <span className="text-lg font-bold text-gray-900">{nextClass.nivel || 'Gral'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NextClassCard;

