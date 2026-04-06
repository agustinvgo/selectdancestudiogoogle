import { UserCircleIcon } from '@heroicons/react/24/solid';

const TopStudents = ({ students }) => {
    const topStudents = students || [];

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Mejores Asistencias</h3>
            </div>
            <div className="card-body p-0">
                <div className="divide-y divide-gray-200/50">
                    {topStudents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No hay datos disponibles</div>
                    ) : (
                        topStudents.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-4 hover:bg-white border border-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                            index === 1 ? 'bg-gray-400/20 text-gray-500' :
                                                index === 2 ? 'bg-orange-500/20 text-orange-500' :
                                                    'bg-blue-500/10 text-blue-500'}
                                    `}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{student.nombre} {student.apellido}</p>
                                        <p className="text-xs text-gray-500">{student.curso || 'Alumno Regular'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{student.asistencia}%</p>
                                    <p className="text-xs text-gray-500">Presentismo</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopStudents;

