import { useState, useEffect } from 'react';
import { PlusIcon, ArrowPathIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportPagos } from '../../utils/exportExcel';
import { pagosAPI } from '../../services/api';
import usePagos from '../../hooks/usePagos';

import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import PaymentStats from '../../components/admin/pagos/PaymentStats';
import PaymentFilters from '../../components/admin/pagos/PaymentFilters';
import PaymentTable from '../../components/admin/pagos/PaymentTable';
import PaymentModal from '../../components/admin/pagos/PaymentModal';
import AdjustmentModal from '../../components/admin/pagos/AdjustmentModal';
import PaymentPlanModal from '../../components/admin/pagos/PaymentPlanModal';
import PaymentMethodModal from '../../components/admin/pagos/PaymentMethodModal';
import PaymentTableSkeleton from '../../components/admin/pagos/PaymentTableSkeleton';

const GestionPagos = () => {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMes, setFiltroMes] = useState(0);
    const [filtroAnio, setFiltroAnio] = useState(0);
    const [filtroAlumno, setFiltroAlumno] = useState('');

    // Bug #2 fix: helper que devuelve la fecha local en YYYY-MM-DD sin desfase UTC
    // new Date().toISOString() en Argentina después de las 21h devuelve el día siguiente
    const localToday = () => new Date().toLocaleDateString('en-CA'); // 'en-CA' => YYYY-MM-DD

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMetodoPagoOpen, setModalMetodoPagoOpen] = useState(false);
    const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
    const [modalPlanOpen, setModalPlanOpen] = useState(false);

    const [formData, setFormData] = useState({});
    const [tipoPagoActivo, setTipoPagoActivo] = useState('unico');
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
    const [metodoOtroTexto, setMetodoOtroTexto] = useState('');
    const [fechaPago, setFechaPago] = useState(localToday());
    const [ajusteData, setAjusteData] = useState({ pagoId: null, tipo: 'descuento', porcentaje: '', motivo: '' });
    const [exporting, setExporting] = useState(false);
    
    const [planCuotasData, setPlanCuotasData] = useState({
        alumno_id: '', concepto: 'Matrícula', monto_total: '', cuotas: 3, fecha_primera_cuota: ''
    });

    const {
        pagosData: pagos, totalItems, stats, alumnos, cursos, resumenFinanciero,
        loadingPagos: loading, createPagoMutation, updatePagoMutation,
        registrando, setRegistrando, generando, isOpen, confirmConfig, closeConfirm,
        toast, calcularRecargoHandler, verComprobante, rechazarComprobante,
        handleSubirComprobante, descargarComprobante, generarPagosMensuales, queryClient
    } = usePagos({ page, pageSize, filtroEstado, filtroMes, filtroAnio, filtroAlumno });

    useEffect(() => { setPage(1); }, [filtroEstado, filtroMes, filtroAnio, filtroAlumno]);

    const abrirModal = () => {
        setFormData({
            alumno_id: '', curso_id: '', concepto: 'Mensualidad', monto: '',
            fecha_vencimiento: '', fecha_limite_sin_recargo: '', metodo_pago: '', estado: 'pendiente', observaciones: ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegistrando(true);
        createPagoMutation.mutate(formData, { onSettled: () => { setRegistrando(false); setModalOpen(false); } });
    };

    const abrirModalMetodoPago = (pagoId) => {
        setPagoSeleccionado(pagoId);
        setMetodoPagoSeleccionado('efectivo');
        setFechaPago(localToday()); // Bug #2 fix: usar fecha local
        setModalMetodoPagoOpen(true);
    };

    const confirmarPago = async () => {
        if (!pagoSeleccionado) return;
        const metodoFinal = metodoPagoSeleccionado === 'otro' ? metodoOtroTexto : metodoPagoSeleccionado;
        if (!metodoFinal) return toast.warning('Por favor especifica el método de pago');

        updatePagoMutation.mutate({
            id: pagoSeleccionado,
            data: { estado: 'pagado', fecha_pago: fechaPago, metodo_pago_realizado: metodoFinal }
        });
        setPagoSeleccionado(null);
        setMetodoOtroTexto('');
        setModalMetodoPagoOpen(false);
    };

    const aplicarAjusteManual = async () => {
        if (!ajusteData.pagoId || !ajusteData.porcentaje) return toast.warning('Debes seleccionar un pago y especificar un porcentaje');
        // Bug #6 fix: guard contra pagos undefined si la query aún está cargando
        const pago = (pagos || []).find(p => p.id === ajusteData.pagoId);
        if (!pago) return;

        const montoBase = pago.monto_original || pago.monto;
        const porcentaje = parseFloat(ajusteData.porcentaje);
        const montoAjuste = Math.round((montoBase * porcentaje / 100) * 100) / 100;
        let updateData = {};

        if (ajusteData.tipo === 'descuento') {
            updateData = { descuento_aplicado: (pago.descuento_aplicado || 0) + montoAjuste, monto: montoBase - montoAjuste, tipo_descuento: ajusteData.motivo, notas_pago: `Descuento manual ${porcentaje}%: ${ajusteData.motivo}` };
        } else {
            updateData = { recargo_aplicado: (pago.recargo_aplicado || 0) + montoAjuste, monto: montoBase + montoAjuste, notas_pago: `Recargo manual ${porcentaje}%: ${ajusteData.motivo}` };
        }

        updatePagoMutation.mutate({ id: ajusteData.pagoId, data: updateData }, {
            onSuccess: () => {
                setModalAjusteOpen(false);
                setAjusteData({ pagoId: null, tipo: 'descuento', porcentaje: '', motivo: '' });
                toast.success(`${ajusteData.tipo === 'descuento' ? 'Descuento' : 'Recargo'} de ${porcentaje}% aplicado`);
            }
        });
    };

    const crearPlanDeCuotas = async () => {
        if (!planCuotasData.alumno_id || !planCuotasData.monto_total || !planCuotasData.fecha_primera_cuota) return toast.warning('Campos obligatorios');
        try {
            await pagosAPI.crearPlanCuotas(planCuotasData);
            queryClient.invalidateQueries(['pagos']);
            queryClient.invalidateQueries(['finanzas']);
            setModalPlanOpen(false);
            setPlanCuotasData({ alumno_id: '', concepto: 'Matrícula', monto_total: '', cuotas: 3, fecha_primera_cuota: '' });
            toast.success(`Plan de ${planCuotasData.cuotas} cuotas creado exitosamente`);
        } catch (error) { toast.error('Error al crear plan de cuotas'); }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await pagosAPI.getAll({ page: 1, limit: 10000, estado: filtroEstado, mes: filtroMes, anio: filtroAnio, alumno_id: filtroAlumno });
            await exportPagos(res.data.data || [], alumnos);
            toast.success('Pagos exportados exitosamente');
        } catch (error) { toast.error('Error al exportar datos'); }
        finally { setExporting(false); }
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
            <PaymentTableSkeleton />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pagos</h1>
                    <p className="text-sm text-gray-500 mt-1">Control de transacciones y estados</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => generarPagosMensuales(filtroMes === 0 ? new Date().getMonth() + 1 : filtroMes, filtroAnio === 0 ? new Date().getFullYear() : filtroAnio, () => {
                        setFiltroMes(filtroMes === 0 ? new Date().getMonth() + 1 : filtroMes);
                        setFiltroAnio(filtroAnio === 0 ? new Date().getFullYear() : filtroAnio);
                    })} disabled={generando} className="btn btn-secondary btn-sm flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50">
                        {generando ? <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" /> : <ArrowPathIcon className="h-4 w-4" />}
                        <span>{generando ? 'Generando...' : 'Generar Mes'}</span>
                    </button>
                    <button onClick={() => setModalPlanOpen(true)} className="btn btn-secondary btn-sm flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">
                        <CalendarIcon className="h-4 w-4" /><span>Plan Cuotas</span>
                    </button>
                    <button onClick={handleExport} disabled={exporting} className="btn btn-secondary btn-sm flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm">
                        <ArrowDownTrayIcon className="h-4 w-4" /><span>{exporting ? '...' : 'Exportar'}</span>
                    </button>
                    <button onClick={abrirModal} className="btn btn-primary btn-sm flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm">
                        <PlusIcon className="h-4 w-4" /><span>Nuevo Pago</span>
                    </button>
                </div>
            </div>

            <PaymentStats resumenFinanciero={resumenFinanciero} />

            <PaymentFilters
                alumnos={alumnos} filtroAlumno={filtroAlumno} setFiltroAlumno={setFiltroAlumno}
                filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
                filtroMes={filtroMes} setFiltroMes={setFiltroMes} filtroAnio={filtroAnio} setFiltroAnio={setFiltroAnio}
                limpiarFiltros={() => { setFiltroEstado('todos'); setFiltroMes(0); setFiltroAlumno(''); }}
                totalResults={stats.total || 0} filteredResults={totalItems || 0}
            />

            <PaymentTable
                pagos={pagos} verComprobante={verComprobante} descargarComprobante={descargarComprobante}
                rechazarComprobante={rechazarComprobante} abrirModalMetodoPago={abrirModalMetodoPago}
                abrirModalAjuste={(id) => { setAjusteData({ ...ajusteData, pagoId: id }); setModalAjusteOpen(true); }}
                calcularRecargoHandler={calcularRecargoHandler} subirComprobante={handleSubirComprobante}
            />

            {totalItems > 0 && <Pagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />}

            <PaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} tipoPagoActivo={tipoPagoActivo} setTipoPagoActivo={setTipoPagoActivo} alumnos={alumnos} cursos={cursos} registrando={registrando} />
            <AdjustmentModal isOpen={modalAjusteOpen} onClose={() => setModalAjusteOpen(false)} ajusteData={ajusteData} setAjusteData={setAjusteData} aplicarAjusteManual={aplicarAjusteManual} pagos={pagos} />
            <PaymentPlanModal isOpen={modalPlanOpen} onClose={() => setModalPlanOpen(false)} planCuotasData={planCuotasData} setPlanCuotasData={setPlanCuotasData} crearPlanDeCuotas={crearPlanDeCuotas} alumnos={alumnos} />
            <PaymentMethodModal isOpen={modalMetodoPagoOpen} onClose={() => setModalMetodoPagoOpen(false)} metodoPagoSeleccionado={metodoPagoSeleccionado} setMetodoPagoSeleccionado={setMetodoPagoSeleccionado} confirmarPago={confirmarPago} metodoOtroTexto={metodoOtroTexto} setMetodoOtroTexto={setMetodoOtroTexto} fechaPago={fechaPago} setFechaPago={setFechaPago} />
            <ConfirmDialog isOpen={isOpen} onClose={closeConfirm} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} variant={confirmConfig.variant} confirmText={confirmConfig.confirmText} cancelText={confirmConfig.cancelText} />
        </div>
    );
};

export default GestionPagos;
