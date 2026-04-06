import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagosAPI } from '../../services/api';
import { ArrowUpTrayIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import useToast from '../../hooks/useToast';

const MisPagos = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [filtro, setFiltro] = useState('todos'); // todos, pendientes, pagados

    const alumnoId = user?.alumno?.id;

    // 1. Fetch Pagos del alumno logueado usando endpoint seguro
    const { data: pagosData, isLoading } = useQuery({
        queryKey: ['pagos', 'mis-pagos'],
        queryFn: async () => {
            const response = await pagosAPI.getMisPagos();
            return response.data.data;
        },
        enabled: !!user
    });

    const pagos = pagosData || [];

    // 2. Upload Comprobante Mutation
    const uploadMutation = useMutation({
        mutationFn: ({ id, formData }) => pagosAPI.subirComprobante(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['pagos', 'alumno', alumnoId]);
            toast.success('Comprobante subido correctamente');
        },
        onError: (error) => {
            console.error('Error uploading receipt:', error);
            toast.error('Error al subir comprobante');
        }
    });

    if (isLoading) return <Loader />;

    const handleFileUpload = (e, pagoId) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('El archivo no debe pesar más de 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('comprobante', file);

        toast.info('Subiendo comprobante...');
        uploadMutation.mutate({ id: pagoId, formData });
    };

    const pagosFiltrados = pagos.filter(pago => {
        if (filtro === 'pendientes') return pago.estado !== 'pagado';
        if (filtro === 'pagados') return pago.estado === 'pagado';
        return true;
    });

    const totalPendiente = pagos
        .filter(p => p.estado !== 'pagado')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const totalPagado = pagos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);

    const cantidadPendientes = pagos.filter(p => p.estado !== 'pagado').length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
                <p className="text-gray-500 mt-1">Estado de cuenta y historial de pagos</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-yellow-900">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Pendiente</p>
                                <p className="text-3xl font-bold text-yellow-500 mt-2">
                                    ${totalPendiente.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {cantidadPendientes} {cantidadPendientes === 1 ? 'pago' : 'pagos'}
                                </p>
                            </div>
                            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <div className="card border-green-900">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Pagado</p>
                                <p className="text-3xl font-bold text-green-500 mt-2">
                                    ${totalPagado.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {pagos.filter(p => p.estado === 'pagado').length} pagos
                                </p>
                            </div>
                            <CheckCircleIcon className="h-12 w-12 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total General</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ${(totalPendiente + totalPagado).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{pagos.length} pagos</p>
                            </div>
                            <ClockIcon className="h-12 w-12 text-gray-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-500">Filtrar:</span>
                        <button
                            onClick={() => setFiltro('todos')}
                            className={`btn btn-sm ${filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Todos ({pagos.length})
                        </button>
                        <button
                            onClick={() => setFiltro('pendientes')}
                            className={`btn btn-sm ${filtro === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pendientes ({cantidadPendientes})
                        </button>
                        <button
                            onClick={() => setFiltro('pagados')}
                            className={`btn btn-sm ${filtro === 'pagados' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Pagados ({pagos.filter(p => p.estado === 'pagado').length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de pagos */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Historial de Pagos</h3>
                </div>
                <div className="card-body">
                    {pagosFiltrados.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No hay pagos para mostrar con este filtro
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {pagosFiltrados.map((pago) => {
                                const vencido = pago.estado !== 'pagado' && new Date(pago.fecha_vencimiento) < new Date();
                                return (
                                    <div
                                        key={pago.id}
                                        className={`p-4 rounded-lg border ${pago.estado === 'pagado' ? 'bg-green-900/10 border-green-900' :
                                            vencido ? 'bg-red-900/10 border-red-900' :
                                                'bg-yellow-900/10 border-yellow-900'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                {pago.curso_nombre && (
                                                    <div className="mb-2">
                                                        <span className="text-indigo-400 font-semibold text-sm">
                                                            📚 {pago.curso_nombre}
                                                        </span>
                                                        {pago.profesor && (
                                                            <span className="text-gray-500 text-xs ml-2">
                                                                • {pago.profesor}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <h4 className="font-semibold text-gray-900 text-lg">{pago.concepto}</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Monto</p>
                                                        <p className="text-green-400 font-bold text-3xl">
                                                            ${parseFloat(pago.monto).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Vencimiento</p>
                                                        <p className="text-gray-900">
                                                            {new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}
                                                        </p>
                                                        {vencido && (
                                                            <span className="text-red-500 text-xs">⚠️ Vencido</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Límite sin recargo</p>
                                                        {pago.fecha_limite_sin_recargo ? (
                                                            <p className="text-yellow-400 font-semibold">
                                                                {new Date(pago.fecha_limite_sin_recargo).toLocaleDateString('es-AR')}
                                                            </p>
                                                        ) : (
                                                            <p className="text-gray-600">-</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">
                                                            {pago.estado === 'pagado' ? 'Fecha de Pago' : 'Estado'}
                                                        </p>
                                                        {pago.estado === 'pagado' ? (
                                                            <p className="text-gray-900">
                                                                {new Date(pago.fecha_pago).toLocaleDateString('es-AR')}
                                                            </p>
                                                        ) : (
                                                            <span className={`badge ${pago.estado === 'pendiente' ? 'badge-warning' : 'badge-info'
                                                                }`}>
                                                                {pago.estado === 'pendiente' ? 'Pendiente' :
                                                                    pago.estado === 'revision' ? 'En Revisión' : 'Parcial'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {pago.observaciones && (
                                                    <div className="mt-3">
                                                        <p className="text-gray-500 text-sm">Observaciones:</p>
                                                        <p className="text-gray-600 text-sm">{pago.observaciones}</p>
                                                    </div>
                                                )}
                                                {pago.metodo_pago && (
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            Método: {pago.metodo_pago}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                {pago.estado === 'pagado' ? (
                                                    <span className="badge badge-success flex items-center">
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        Pagado
                                                    </span>
                                                ) : pago.estado === 'revision' ? (
                                                    <span className="badge badge-info flex items-center bg-blue-500/20 text-blue-300 border-blue-500/50">
                                                        <DocumentCheckIcon className="h-4 w-4 mr-1" />
                                                        En Revisión
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-2">
                                                        {vencido ? (
                                                            <span className="badge badge-error">Vencido</span>
                                                        ) : (
                                                            <span className="badge badge-warning">Pendiente</span>
                                                        )}

                                                        {!pago.comprobante_url && (
                                                            <label className="btn btn-sm btn-outline btn-info flex items-center gap-2 cursor-pointer">
                                                                <ArrowUpTrayIcon className="h-4 w-4" />
                                                                Informar Pago
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*,application/pdf"
                                                                    onChange={(e) => handleFileUpload(e, pago.id)}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Alerta de pagos pendientes */}
            {cantidadPendientes > 0 && (
                <div className="card border-2 border-yellow-600 bg-yellow-900/10">
                    <div className="card-body">
                        <div className="flex items-start space-x-3">
                            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-yellow-500 text-lg">
                                    Tienes {cantidadPendientes} {cantidadPendientes === 1 ? 'pago pendiente' : 'pagos pendientes'}
                                </h4>
                                <p className="text-gray-600 text-sm mt-1">
                                    Comunícate con la administración para regularizar tus pagos y evitar recargos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisPagos;

