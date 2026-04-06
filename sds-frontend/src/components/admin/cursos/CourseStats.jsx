const CourseStats = ({ cursos, alumnos }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-white border-gray-200">
                <div className="card-body">
                    <p className="text-sm text-gray-500">Total de Cursos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{cursos.length}</p>
                </div>
            </div>
            <div className="card bg-white border-green-900/50">
                <div className="card-body">
                    <p className="text-sm text-gray-500">Cursos Activos</p>
                    <p className="text-3xl font-bold text-green-500 mt-2">
                        {cursos.filter(c => c.activo === 1).length}
                    </p>
                </div>
            </div>
            <div className="card bg-white border-blue-900/50">
                <div className="card-body">
                    <p className="text-sm text-gray-500">Total Alumnos</p>
                    <p className="text-3xl font-bold text-blue-500 mt-2">{alumnos.length}</p>
                </div>
            </div>
        </div>
    );
};

export default CourseStats;

