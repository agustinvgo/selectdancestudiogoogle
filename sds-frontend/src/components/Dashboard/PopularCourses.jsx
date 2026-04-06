const PopularCourses = ({ data }) => {
    // data: [{ nombre: 'Ballet I', alumnos_inscritos: 15, porcentaje_ocupacion: 90 }, ...]

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Top 5 Cursos</h3>
            </div>
            <div className="card-body overflow-y-auto">
                <div className="space-y-4">
                    {data && data.length > 0 ? (
                        data.map((curso, index) => (
                            <div key={curso.id || index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-900 font-medium">{curso.nombre}</span>
                                    <span className="text-gray-500 text-xs">{curso.alumnos_inscritos} alumnos</span>
                                </div>
                                <div className="w-full bg-gray-100/50 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${parseFloat(curso.porcentaje_ocupacion) >= 90 ? 'bg-green-500' :
                                                parseFloat(curso.porcentaje_ocupacion) >= 70 ? 'bg-blue-500' :
                                                    'bg-yellow-500'
                                            }`}
                                        style={{ width: `${Math.min(parseFloat(curso.porcentaje_ocupacion), 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-gray-500">
                                        {curso.porcentaje_ocupacion}% ocupación
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            No hay datos de cursos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopularCourses;

