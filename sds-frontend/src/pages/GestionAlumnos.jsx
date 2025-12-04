import { useState, useEffect } from 'react';
import { alumnosAPI, cursosAPI, pagosAPI } from '../services/api';
import { exportAlumnos } from '../utils/exportExcel';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

const GestionAlumnos = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        dni: '',
        telefono: '',
        email_padre: '',
        direccion: '',
        cursoIds: [], // array of selected course IDs for auto‑enrollment
        montoInicial: '',
        conceptoInicial: 'Matrícula'
    });

    const navigate = useNavigate();

    // Load students and courses when component mounts
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [alumnosRes, cursosRes] = await Promise.all([
                alumnosAPI.getAll(),
                cursosAPI.getAll()
            ]);
            setAlumnos(alumnosRes.data.data);
            setCursos(cursosRes.data.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (alumno = null) => {
        if (alumno) {
            setEditando(alumno);
            setFormData({
                email: alumno.email || '',
                password: '', // password not edited here
                nombre: alumno.nombre || '',
                apellido: alumno.apellido || '',
                fecha_nacimiento: alumno.fecha_nacimiento || '',
                dni: alumno.dni || '',
                telefono: alumno.telefono || '',
                email_padre: alumno.email_padre || '',
                direccion: alumno.direccion || '',
                cursoIds: [] // editing does not pre‑select courses
            });
        } else {
            setEditando(null);
            setFormData({
                email: '',
                password: '',
                nombre: '',
                apellido: '',
                fecha_nacimiento: '',
                dni: '',
                telefono: '',
                email_padre: '',
                direccion: '',
                cursoIds: []
            });
        }
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditando(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await alumnosAPI.update(editando.id, formData);
                alert('Alumno actualizado correctamente');
            } else {
                // crear alumno
                const response = await alumnosAPI.create(formData);
                const nuevoAlumnoId = response.data.data.id;
                // inscribir en los cursos seleccionados
                if (formData.cursoIds && formData.cursoIds.length > 0) {
                    for (const cid of formData.cursoIds) {
                        try {
                            await cursosAPI.inscribirAlumno(cid, { alumno_id: nuevoAlumnoId });
                        } catch (inscErr) {
                            console.error('Error inscribiendo en curso', cid, inscErr);
                        }
                    }
                }

                // Crear pago inicial si se especificó
                if (formData.montoInicial && parseFloat(formData.montoInicial) > 0) {
                    try {
                        await pagosAPI.create({
                            alumno_id: nuevoAlumnoId,
                            monto: parseFloat(formData.montoInicial),
                            concepto: formData.conceptoInicial || 'Matrícula',
                            fecha_vencimiento: new Date().toISOString().split('T')[0], // Vence hoy
                            estado: 'pendiente'
                        });
                    } catch (pagoErr) {
                        console.error('Error creando pago inicial', pagoErr);
                        alert('Alumno creado, pero hubo un error al registrar el pago inicial.');
                    }
                }

                alert('Alumno creado correctamente');
            }
            cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error('Error guardando alumno:', error);
            alert(error.response?.data?.message || 'Error al guardar alumno');
        }
    };

    const eliminarAlumno = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este alumno?')) return;
        try {
            await alumnosAPI.delete(id);
            cargarDatos();
        } catch (error) {
            console.error('Error eliminando alumno:', error);
            alert('Error al eliminar alumno');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Alumnos</h1>
                    <p className="text-gray-400 mt-1">Administra los estudiantes del estudio</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => exportAlumnos && exportAlumnos(alumnos)}
                        className="btn btn-secondary flex items-center space-x-2"
                        disabled={alumnos.length === 0}
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Exportar a Excel</span>
                    </button>
                    <button onClick={() => abrirModal()} className="btn btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nuevo Alumno</span>
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre Completo</th>
                                    <th>Email</th>
                                    <th>DNI</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumnos.map((alumno) => (
                                    <tr key={alumno.id}>
                                        <td className="font-medium text-white">
                                            {alumno.nombre} {alumno.apellido}
                                        </td>
                                        <td className="text-gray-400">{alumno.email}</td>
                                        <td>{alumno.dni || '-'}</td>
                                        <td>{alumno.telefono || '-'}</td>
                                        <td>
                                            <span className={`badge ${alumno.usuario_activo ? 'badge-success' : 'badge-error'}`}>
                                                {alumno.usuario_activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Ver ficha completa"
                                                >
                                                    <EyeIcon className="h-5 w-5 text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => abrirModal(alumno)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <PencilIcon className="h-5 w-5 text-yellow-400" />
                                                </button>
                                                <button
                                                    onClick={() => eliminarAlumno(alumno.id)}
                                                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon className="h-5 w-5 text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for create / edit */}
            <Modal isOpen={modalOpen} onClose={cerrarModal} title={editando ? 'Editar Alumno' : 'Nuevo Alumno'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="input w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Apellido</label>
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="input w-full"
                                required
                            />
                        </div>
                    </div>

                    {!editando && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input w-full"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">DNI</label>
                        <input
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                        <input
                            type="text"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email del Padre/Tutor</label>
                        <input
                            type="email"
                            value={formData.email_padre}
                            onChange={(e) => setFormData({ ...formData, email_padre: e.target.value })}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                        <textarea
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            className="input w-full"
                            rows={3}
                        />
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <label className="block text-sm font-medium text-blue-400 mb-2">Inscribir en Cursos (Opcional)</label>
                        <select
                            multiple
                            value={formData.cursoIds}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                                setFormData({ ...formData, cursoIds: selected });
                            }}
                            className="input w-full"
                        >
                            {cursos.filter(c => c.activo).map(curso => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre} ({curso.horario_dia} {curso.horario_hora})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Selecciona uno o varios cursos; el alumno será inscrito automáticamente en cada uno al crearse.
                        </p>
                    </div>

                    {!editando && (
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <label className="block text-sm font-medium text-green-400 mb-2">Pago Inicial (Opcional)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Monto a Pagar</label>
                                    <input
                                        type="number"
                                        value={formData.montoInicial}
                                        onChange={(e) => setFormData({ ...formData, montoInicial: e.target.value })}
                                        className="input w-full"
                                        placeholder="0.00"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Concepto</label>
                                    <select
                                        value={formData.conceptoInicial}
                                        onChange={(e) => setFormData({ ...formData, conceptoInicial: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option>Matrícula</option>
                                        <option>Mensualidad</option>
                                        <option>Uniforme</option>
                                        <option>Evento</option>
                                        <option>Otro</option>
                                    </select>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Si ingresas un monto, se creará automáticamente un pago pendiente con vencimiento hoy.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={cerrarModal} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editando ? 'Guardar Cambios' : 'Crear Alumno'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default GestionAlumnos;
