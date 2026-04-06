import CourseCard from './CourseCard';

const CourseGrid = ({
    cursos,
    expandedCursoId,
    toggleParticipantes,
    participantes,
    loadingParticipantes,
    alumnos,
    isProfesor,
    onEdit,
    onDelete,
    onEnroll,
    onUnenroll
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cursos.map((curso) => (
                <CourseCard
                    key={curso.id}
                    curso={curso}
                    isExpanded={expandedCursoId === curso.id}
                    onToggle={() => toggleParticipantes(curso.id)}
                    participantes={participantes}
                    loadingParticipantes={loadingParticipantes}
                    alumnos={alumnos}
                    isProfesor={isProfesor}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onEnroll={onEnroll}
                    onUnenroll={onUnenroll}
                />
            ))}
        </div>
    );
};

export default CourseGrid;

