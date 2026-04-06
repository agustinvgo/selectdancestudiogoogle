import Modal from '../../Modal';

const InscripcionModal = ({
    isOpen,
    onClose,
    eventoSeleccionado,
    alumnos,
    inscribirAlumno
}) => {
    const alumnosDisponibles = alumnos.filter(
        alumno => !eventoSeleccionado?.inscritos?.some(inscrito => inscrito.usuario_id === alumno.usuario_id)
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inscribir Alumno">
            <div className="space-y-4">
                <p className="text-gray-600">
                    Selecciona un alumno para inscribir en: <span className="font-bold text-gray-900">{eventoSeleccionado?.nombre}</span>
                </p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {alumnosDisponibles.map((alumno) => (
                        <button
                            key={alumno.usuario_id}
                            onClick={() => inscribirAlumno(alumno.id)}
                            className="w-full p-4 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-500 transition-all text-left"
                        >
                            <p className="text-gray-900 font-medium">
                                {alumno.nombre} {alumno.apellido}
                            </p>
                            <p className="text-sm text-gray-500">{alumno.email}</p>
                        </button>
                    ))}
                    {alumnosDisponibles.length === 0 && (
                        <p className="text-center text-gray-500 py-8">Todos los alumnos ya están inscritos en este evento</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default InscripcionModal;
