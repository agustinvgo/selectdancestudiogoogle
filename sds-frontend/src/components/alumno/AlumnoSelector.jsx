import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const AlumnoSelector = ({ className = '' }) => {
    const { alumnos, alumnoActivo, setAlumnoActivo } = useAuth();

    if (alumnos.length < 2) return null;

    return (
        <label className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm ${className}`}>
            <UserGroupIcon className="h-4 w-4 text-sds-red" />
            <span className="sr-only">Alumno seleccionado</span>
            <select
                value={alumnoActivo?.id || ''}
                onChange={(event) => setAlumnoActivo(event.target.value)}
                className="max-w-40 bg-transparent font-semibold text-gray-700 outline-none"
                aria-label="Cambiar alumno"
            >
                {alumnos.map((alumno) => (
                    <option key={alumno.id} value={alumno.id}>
                        {alumno.nombre} {alumno.apellido}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default AlumnoSelector;
