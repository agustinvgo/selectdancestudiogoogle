import { useState, useEffect } from 'react';
import { pagosAPI, alumnosAPI, cursosAPI } from '../services/api';
import { PlusIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, FunnelIcon, ArrowDownTrayIcon, CalendarIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { exportPagos } from '../utils/exportExcel';

const GestionPagos = () => {
    const [pagos, setPagos] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMes, setFiltroMes] = useState(0); // 0 = Todos los meses
    const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
    const [resumenFinanciero, setResumenFinanciero] = useState(null);
    const [formData, setFormData] = useState({
        alumno_id: '',
        curso_id: '',
        concepto: 'Mensualidad',
        monto: '',
        fecha_vencimiento: '',
        fecha_limite_sin_recargo: '',
        metodo_pago: '',
        estado: 'pendiente',
        observaciones: '',
        plan_cuotas: null,
        cuotas: 1
    });
    const [modalPlanOpen, setModalPlanOpen] = useState(false);
    const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
    const [ajusteData, setAjusteData] = useState({
        pagoId: null,
        tipo: 'descuento',
        porcentaje: '',
        motivo: ''
    });
    const [planCuotasData, setPlanCuotasData] = useState({
        alumno_id: '',
        concepto: 'Matrícula',
        monto_total: '',
        cuotas: 3,
        fecha_primera_cuota: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        cargarResumenFinanciero();
    }, [filtroMes, filtroAnio]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [pagosRes, alumnosRes, cursosRes] = await Promise.all([
                pagosAPI.getAll(),
                alumnosAPI.getAll(),
                cursosAPI.getAll()
            ]);
            setPagos(pagosRes.data.data || []);
            setAlumnos(alumnosRes.data.data || []);
            setCursos(cursosRes.data.data || []);
            await cargarResumenFinanciero();
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarResumenFinanciero = async () => {
        try {
            const resumenRes = await pagosAPI.getEstadoFinanciero(filtroMes, filtroAnio);
            setResumenFinanciero(resumenRes.data.data || null);
        } catch (error) {
            console.error('Error cargando resumen financiero:', error);
        }
    };

    const abrirModal = () => {
        setFormData({
            alumno_id: '',
            curso_id: '',
            concepto: 'Mensualidad',
            monto: '',
            fecha_vencimiento: '',
            fecha_limite_sin_recargo: '',
            metodo_pago: '',
            estado: 'pendiente',
            observaciones: ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await pagosAPI.create(formData);
            await cargarDatos();
            setModalOpen(false);
            alert('✅ Pago registrado exitosamente');
        } catch (error) {
            console.error('Error registrando pago:', error);
            alert('❌ Error al registrar pago');
        }
    };

    const marcarComoPagado = async (pagoId) => {
        const metodo = prompt('Método de pago (efectivo/transferencia/tarjeta/mercadopago):');
        if (!metodo) return;

        try {
            await pagosAPI.update(pagoId, {
                estado: 'pagado',
                fecha_pago: new Date().toISOString().split('T')[0],
                metodo_pago_realizado: metodo.toLowerCase()
            });
            await cargarDatos();
            alert('✅ Pago actualizado');
        } catch (error) {
            console.error('Error actualizando pago:', error);
            alert('❌ Error al actualizar pago');
        }
    };

    const calcularRecargoHandler = async (pagoId) => {
        try {
            const response = await pagosAPI.calcularRecargo(pagoId);
            await cargarDatos();
            alert(response.data.message);
        } catch (error) {
            console.error('Error calculando recargo:', error);
            alert('❌ Error al calcular recargo');
        }
    };

    const aplicarAjusteManual = async () => {
        if (!ajusteData.pagoId || !ajusteData.porcentaje) {
            alert('⚠️ Debes seleccionar un pago y especificar un porcentaje');
            return;
        }

        try {
            const pago = pagos.find(p => p.id === ajusteData.pagoId);
            if (!pago) return;

            const montoBase = pago.monto_original || pago.monto;
            const porcentaje = parseFloat(ajusteData.porcentaje);
            const montoAjuste = Math.round((montoBase * porcentaje / 100) * 100) / 100;

            let nuevoMonto;
            let updateData = {};

            if (ajusteData.tipo === 'descuento') {
                nuevoMonto = montoBase - montoAjuste;
                updateData = {
                    descuento_aplicado: (pago.descuento_aplicado || 0) + montoAjuste,
                    monto: nuevoMonto,
                    tipo_descuento: ajusteData.motivo,
                    notas_pago: `Descuento manual ${porcentaje}%: ${ajusteData.motivo}`
                };
            } else {
                nuevoMonto = montoBase + montoAjuste;
                updateData = {
                    recargo_aplicado: (pago.recargo_aplicado || 0) + montoAjuste,
                    monto: nuevoMonto,
                    notas_pago: `Recargo manual ${porcentaje}%: ${ajusteData.motivo}`
                };
            }

            await pagosAPI.update(ajusteData.pagoId, updateData);
            await cargarDatos();
            setModalAjusteOpen(false);
            setAjusteData({ pagoId: null, tipo: 'descuento', porcentaje: '', motivo: '' });
            alert(`✅ ${ajusteData.tipo === 'descuento' ? 'Descuento' : 'Recargo'} de ${porcentaje}% aplicado correctamente`);
        } catch (error) {
            console.error('Error aplicando ajuste:', error);
            alert('❌ Error al aplicar ajuste');
        }
    };

    const descargarComprobante = async (pagoId) => {
        try {
            const response = await pagosAPI.descargarComprobante(pagoId);

            // Verificar si la respuesta es un JSON (error) en lugar de un PDF
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Error al generar comprobante');
            }

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `comprobante_${String(pagoId).padStart(8, '0')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Limpiar memoria
        } catch (error) {
            console.error('Error descargando comprobante:', error);
            alert(`❌ Error: ${error.message || 'No se pudo descargar el comprobante'}`);
        }
    };

    const crearPlanDeCuotas = async () => {
        if (!planCuotasData.alumno_id || !planCuotasData.monto_total || !planCuotasData.fecha_primera_cuota) {
            alert('⚠️ Debes completar todos los campos obligatorios');
            return;
        }

        try {
            await pagosAPI.crearPlanCuotas(planCuotasData);
            await cargarDatos();
            setModalPlanOpen(false);
            setPlanCuotasData({
                alumno_id: '',
                concepto: 'Matrícula',
                monto_total: '',
                cuotas: 3,
                fecha_primera_cuota: ''
            });
            alert(`✅ Plan de ${planCuotasData.cuotas} cuotas creado exitosamente`);
        } catch (error) {
            console.error('Error creando plan de cuotas:', error);
            alert('❌ Error al crear plan de cuotas');
        }
    };

    const generarPagosMensuales = async () => {
        if (!confirm('¿Deseas generar los pagos mensuales heredados para todos los alumnos activos?')) return;

        try {
            const response = await pagosAPI.generarPagosMensuales(filtroMes, filtroAnio);
            await cargarDatos();
            alert(response.data.message || '✅ Pagos mensuales generados exitosamente');
        } catch (error) {
            console.error('Error generando pagos:', error);
            alert('❌ Error al generar pagos mensuales');
        }
    };

    const handleExport = () => {
        const pagosFiltrados = pagosFiltradosComputados();
        exportPagos(pagosFiltrados, alumnos);
    };

    const pagosFiltradosComputados = () => {
        return pagos.filter(pago => {
            const cumpleEstado = filtroEstado === 'todos' || pago.estado === filtroEstado;
            // Si filtroMes es 0, mostrar todos los meses
            const cumpleFecha = filtroMes === 0 ? true : (pago.mes === filtroMes && pago.anio === filtroAnio);
            return cumpleEstado && cumpleFecha;
        });
    };

    if (loading) return <Loader />;

    const pagosFiltrados = pagosFiltradosComputados();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Pagos</h1>
                    <p className="text-gray-400 mt-1">Administra y monitorea los pagos de los alumnos</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={generarPagosMensuales}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Generar Mensuales</span>
                    </button>
                    <button
                        onClick={() => setModalPlanOpen(true)}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <CalendarIcon className="h-5 w-5" />
                        <span>Plan de Cuotas</span>
                    </button>
                    <button onClick={handleExport} className="btn btn-secondary flex items-center space-x-2">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Exportar</span>
                    </button>
                    <button onClick={abrirModal} className="btn btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nuevo Pago</span>
                    </button>
                </div>
            </div>

            {resumenFinanciero && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card bg-gradient-to-br from-green-900 to-green-800 border-green-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-100 opacity-80">Total Cobrado</p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        ${resumenFinanciero.total_cobrado?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <CheckCircleIcon className="h-12 w-12 text-green-300 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-900 to-red-800 border-red-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-100 opacity-80">Total Pendiente</p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        ${resumenFinanciero.total_pendiente?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <XCircleIcon className="h-12 w-12 text-red-300 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-100 opacity-80">Total Esperado</p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        ${resumenFinanciero.total_esperado?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <CurrencyDollarIcon className="h-12 w-12 text-blue-300 opacity-50" />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-100 opacity-80">Tasa de Cobro</p>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {resumenFinanciero.tasa_cobro?.toFixed(1)}%
                                    </p>
                                </div>
                                <FunnelIcon className="h-12 w-12 text-purple-300 opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-bold text-white">Filtros y Búsqueda</h2>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="input w-full"
                            >
                                <option value="todos">Todos</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="pagado">Pagado</option>
                                <option value="vencido">Vencido</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Mes</label>
                            <select
                                value={filtroMes}
                                onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                                className="input w-full"
                            >
                                <option value="0">Todos</option>
                                <option value="1">Enero</option>
                                <option value="2">Febrero</option>
                                <option value="3">Marzo</option>
                                <option value="4">Abril</option>
                                <option value="5">Mayo</option>
                                <option value="6">Junio</option>
                                <option value="7">Julio</option>
                                <option value="8">Agosto</option>
                                <option value="9">Septiembre</option>
                                <option value="10">Octubre</option>
                                <option value="11">Noviembre</option>
                                <option value="12">Diciembre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Año</label>
                            <select
                                value={filtroAnio}
                                onChange={(e) => setFiltroAnio(parseInt(e.target.value))}
                                className="input w-full"
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button onClick={() => { setFiltroEstado('todos'); setFiltroMes(0); }} className="btn btn-secondary w-full">
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="text-xl font-bold text-white">
                        Lista de Pagos ({pagosFiltrados.length})
                    </h2>
                </div>
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Alumno</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Concepto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Período</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Monto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vencimiento</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {pagosFiltrados.map((pago) => (
                                    <tr key={pago.id} className="hover:bg-gray-800 transition-colors">
                                        <td className="px-4 py-4 text-sm text-white">
                                            {pago.alumno_nombre} {pago.alumno_apellido}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-300">
                                            {pago.concepto}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-300">
                                            {pago.mes}/{pago.anio}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-right font-semibold text-white">
                                            ${pago.monto?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-300">
                                            {pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded ${pago.estado === 'pagado' ? 'bg-green-900 text-green-200' :
                                                pago.estado === 'vencido' ? 'bg-red-900 text-red-200' :
                                                    'bg-yellow-900 text-yellow-200'
                                                }`}>
                                                {pago.estado?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end space-x-2">
                                                {pago.estado === 'pagado' && (
                                                    <button
                                                        onClick={() => descargarComprobante(pago.id)}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        Descargar Comprobante
                                                    </button>
                                                )}
                                                {pago.estado !== 'pagado' && (
                                                    <>
                                                        <button
                                                            onClick={() => marcarComoPagado(pago.id)}
                                                            className="btn btn-sm btn-success"
                                                        >
                                                            Marcar Pagado
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setAjusteData({ ...ajusteData, pagoId: pago.id });
                                                                setModalAjusteOpen(true);
                                                            }}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            Ajustar Monto
                                                        </button>
                                                        {pago.estado === 'vencido' && (
                                                            <button
                                                                onClick={() => calcularRecargoHandler(pago.id)}
                                                                className="btn btn-sm btn-warning"
                                                            >
                                                                Calcular Recargo
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Nuevo Pago */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Pago">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Alumno</label>
                        <select
                            value={formData.alumno_id}
                            onChange={(e) => setFormData({ ...formData, alumno_id: e.target.value })}
                            className="input w-full"
                            required
                        >
                            <option value="">Seleccionar alumno...</option>
                            {alumnos.map((alumno) => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} {alumno.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Curso (opcional)</label>
                        <select
                            value={formData.curso_id}
                            onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
                            className="input w-full"
                        >
                            <option value="">Sin curso asociado</option>
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre} - {curso.dia_semana} {curso.hora_inicio}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Concepto</label>
                            <select
                                value={formData.concepto}
                                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                                className="input w-full"
                            >
                                <option>Mensualidad</option>
                                <option>Matrícula</option>
                                <option>Evento</option>
                                <option>Uniforme</option>
                                <option>Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Monto</label>
                            <input
                                type="number"
                                value={formData.monto}
                                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                                className="input w-full"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Vencimiento</label>
                            <input
                                type="date"
                                value={formData.fecha_vencimiento}
                                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                                className="input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Límite sin recargo
                            </label>
                            <input
                                type="date"
                                value={formData.fecha_limite_sin_recargo}
                                onChange={(e) => setFormData({ ...formData, fecha_limite_sin_recargo: e.target.value })}
                                className="input w-full"
                                placeholder="Deja vacío para auto-calcular"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Observaciones</label>
                        <textarea
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            className="input w-full"
                            rows="3"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Registrar Pago
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Ajuste Manual */}
            <Modal isOpen={modalAjusteOpen} onClose={() => setModalAjusteOpen(false)} title="Ajustar Monto">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Ajuste</label>
                        <select
                            value={ajusteData.tipo}
                            onChange={(e) => setAjusteData({ ...ajusteData, tipo: e.target.value })}
                            className="input w-full"
                        >
                            <option value="descuento">Descuento</option>
                            <option value="recargo">Recargo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Porcentaje (%)</label>
                        <input
                            type="number"
                            value={ajusteData.porcentaje}
                            onChange={(e) => setAjusteData({ ...ajusteData, porcentaje: e.target.value })}
                            className="input w-full"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="Ingrese el porcentaje del ajuste"
                        />
                        {ajusteData.pagoId && ajusteData.porcentaje && (() => {
                            const pago = pagos.find(p => p.id === ajusteData.pagoId);
                            if (pago) {
                                const montoBase = pago.monto_original || pago.monto;
                                const porcentaje = parseFloat(ajusteData.porcentaje);
                                const montoCalculado = Math.round((montoBase * porcentaje / 100) * 100) / 100;
                                const nuevoMonto = ajusteData.tipo === 'descuento'
                                    ? montoBase - montoCalculado
                                    : montoBase + montoCalculado;
                                return (
                                    <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                        <p className="text-sm text-gray-400">Monto Base: <span className="text-white font-semibold">${montoBase.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                        <p className="text-sm text-gray-400">{ajusteData.tipo === 'descuento' ? 'Descuento' : 'Recargo'}: <span className="text-yellow-400 font-semibold">${montoCalculado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                        <p className="text-sm text-gray-400 mt-2 pt-2 border-t border-gray-700">Nuevo Monto: <span className="text-green-400 font-bold text-lg">${nuevoMonto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Motivo</label>
                        <textarea
                            value={ajusteData.motivo}
                            onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
                            className="input w-full"
                            rows="3"
                            placeholder="Ingrese el motivo del ajuste"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalAjusteOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={aplicarAjusteManual}
                            className="btn btn-primary"
                        >
                            Aplicar Ajuste
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Plan de Cuotas */}
            <Modal isOpen={modalPlanOpen} onClose={() => setModalPlanOpen(false)} title="Crear Plan de Cuotas">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Alumno</label>
                        <select
                            value={planCuotasData.alumno_id}
                            onChange={(e) => setPlanCuotasData({ ...planCuotasData, alumno_id: e.target.value })}
                            className="input w-full"
                            required
                        >
                            <option value="">Seleccionar alumno...</option>
                            {alumnos.map((alumno) => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} {alumno.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Concepto</label>
                        <select
                            value={planCuotasData.concepto}
                            onChange={(e) => setPlanCuotasData({ ...planCuotasData, concepto: e.target.value })}
                            className="input w-full"
                        >
                            <option>Matrícula</option>
                            <option>Evento</option>
                            <option>Uniforme</option>
                            <option>Otro</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Monto Total</label>
                            <input
                                type="number"
                                value={planCuotasData.monto_total}
                                onChange={(e) => setPlanCuotasData({ ...planCuotasData, monto_total: e.target.value })}
                                className="input w-full"
                                min="0"
                                step="100"
                                placeholder="Monto total a dividir"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Número de Cuotas</label>
                            <input
                                type="number"
                                value={planCuotasData.cuotas}
                                onChange={(e) => setPlanCuotasData({ ...planCuotasData, cuotas: parseInt(e.target.value) })}
                                className="input w-full"
                                min="2"
                                max="12"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Primera Cuota</label>
                        <input
                            type="date"
                            value={planCuotasData.fecha_primera_cuota}
                            onChange={(e) => setPlanCuotasData({ ...planCuotasData, fecha_primera_cuota: e.target.value })}
                            className="input w-full"
                            required
                        />
                    </div>

                    {planCuotasData.monto_total && planCuotasData.cuotas > 0 && (
                        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400">
                                Monto por cuota: <span className="text-green-400 font-semibold">
                                    ${(parseFloat(planCuotasData.monto_total) / planCuotasData.cuotas).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Se crearán {planCuotasData.cuotas} pagos mensuales
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalPlanOpen(false)}
                            className="btn btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={crearPlanDeCuotas}
                            className="btn btn-primary"
                        >
                            Crear Plan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GestionPagos;
