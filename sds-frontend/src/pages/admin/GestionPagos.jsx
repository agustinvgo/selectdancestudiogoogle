import { useState, useEffect, useMemo } from 'react';
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
import PaymentNoteModal from '../../components/admin/pagos/PaymentNoteModal';
import PaymentImpactModal from '../../components/admin/pagos/PaymentImpactModal';
import PaymentTableSkeleton from '../../components/admin/pagos/PaymentTableSkeleton';

const GestionPagos = () => {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroMes, setFiltroMes] = useState(0);
    const [filtroAnio, setFiltroAnio] = useState(0);
    const [filtroAlumno, setFiltroAlumno] = useState('');
    const [filtroImpacto, setFiltroImpacto] = useState('todos');

    // Bug #2 fix: helper que devuelve la fecha local en YYYY-MM-DD sin desfase UTC
    // new Date().toISOString() en Argentina después de las 21h devuelve el día siguiente
    const localToday = () => new Date().toLocaleDateString('en-CA'); // 'en-CA' => YYYY-MM-DD

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMetodoPagoOpen, setModalMetodoPagoOpen] = useState(false);
    const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
    const [modalPlanOpen, setModalPlanOpen] = useState(false);
    const [modalNotaOpen, setModalNotaOpen] = useState(false);
    const [modalImpactoOpen, setModalImpactoOpen] = useState(false);

    const [formData, setFormData] = useState({});
    const [tipoPagoActivo, setTipoPagoActivo] = useState('unico');
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
    const [metodoOtroTexto, setMetodoOtroTexto] = useState('');
    const [fechaPago, setFechaPago] = useState(localToday());
    const [ajusteData, setAjusteData] = useState({ pago: null, nuevoMonto: '', motivo: '' });
    const [guardandoAjuste, setGuardandoAjuste] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [guardandoNota, setGuardandoNota] = useState(false);
    const [notaPago, setNotaPago] = useState({ pago: null, texto: '' });
    const [guardandoImpacto, setGuardandoImpacto] = useState(false);
    const [impactoData, setImpactoData] = useState({ pago: null, impacto_financiero: 'ingreso', categoria_movimiento: '', notas_pago: '' });
    
    const [planCuotasData, setPlanCuotasData] = useState({
        alumno_id: '', concepto: 'Matrícula', descripcion: '', monto_total: '', cuotas: 3, fecha_primera_cuota: ''
    });

    const {
        pagosData: pagos, totalItems, stats, alumnos, cursos, resumenFinanciero,
        loadingPagos: loading, createPagoMutation, updatePagoMutation,
        registrando, setRegistrando, generando, isOpen, confirmConfig, closeConfirm,
        toast, calcularRecargoHandler, verComprobante, rechazarComprobante,
        handleSubirComprobante, descargarComprobante, generarPagosMensuales, queryClient
    } = usePagos({ page, pageSize, filtroEstado, filtroMes, filtroAnio, filtroAlumno, filtroImpacto });

    const alumnosOrdenados = useMemo(() => [...(alumnos || [])].sort((a, b) => {
        const nombreA = `${a.nombre || ''} ${a.apellido || ''}`.trim();
        const nombreB = `${b.nombre || ''} ${b.apellido || ''}`.trim();
        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
    }), [alumnos]);

    useEffect(() => { setPage(1); }, [filtroEstado, filtroMes, filtroAnio, filtroAlumno, filtroImpacto]);

    const abrirModal = () => {
        setFormData({
            alumno_id: '', curso_id: '', concepto: 'Mensualidad', monto: '',
            fecha_vencimiento: '', fecha_limite_sin_recargo: '', metodo_pago: '', estado: 'pendiente',
            observaciones: '', notas_pago: '', impacto_financiero: 'ingreso', categoria_movimiento: '',
            modalidad_pago: 'unico', cuotas: 3
        });
        setTipoPagoActivo('mensualidad');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegistrando(true);
        if (formData.modalidad_pago === 'cuotas') {
            try {
                const response = await pagosAPI.crearPlanCuotas({
                    alumno_id: formData.alumno_id,
                    curso_id: formData.curso_id || null,
                    concepto: formData.concepto,
                    monto_total: Number(formData.monto),
                    cuotas: Number.parseInt(formData.cuotas, 10),
                    fecha_primera_cuota: formData.fecha_vencimiento,
                    metodo_pago: formData.metodo_pago || null,
                    descripcion: formData.notas_pago || '',
                    impacto_financiero: formData.impacto_financiero || 'ingreso'
                });
                queryClient.invalidateQueries(['pagos']);
                queryClient.invalidateQueries(['finanzas']);
                setModalOpen(false);
                toast.success(response.data?.message || 'Plan de cuotas creado exitosamente');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al crear el plan de cuotas');
            } finally {
                setRegistrando(false);
            }
            return;
        }

        createPagoMutation.mutate(formData, {
            onSuccess: () => setModalOpen(false),
            onSettled: () => setRegistrando(false)
        });
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

    const abrirModalNota = (pago) => {
        setNotaPago({ pago, texto: pago.notas_pago || '' });
        setModalNotaOpen(true);
    };

    const guardarNotaPago = () => {
        if (!notaPago.pago?.id || guardandoNota) return;
        setGuardandoNota(true);
        updatePagoMutation.mutate({
            id: notaPago.pago.id,
            data: { notas_pago: notaPago.texto.trim().slice(0, 500) || null }
        }, {
            onSuccess: () => {
                setModalNotaOpen(false);
                setNotaPago({ pago: null, texto: '' });
            },
            onSettled: () => setGuardandoNota(false)
        });
    };

    const abrirModalImpacto = (pago) => {
        setImpactoData({
            pago,
            impacto_financiero: pago.impacto_financiero || 'ingreso',
            categoria_movimiento: pago.categoria_movimiento || '',
            notas_pago: pago.notas_pago || ''
        });
        setModalImpactoOpen(true);
    };

    const guardarImpacto = () => {
        if (!impactoData.pago?.id || guardandoImpacto) return;
        if (impactoData.impacto_financiero !== 'ingreso' && (!impactoData.categoria_movimiento || !impactoData.notas_pago.trim())) {
            return toast.warning('La categoría y la descripción son obligatorias');
        }
        setGuardandoImpacto(true);
        updatePagoMutation.mutate({
            id: impactoData.pago.id,
            data: {
                impacto_financiero: impactoData.impacto_financiero,
                categoria_movimiento: impactoData.impacto_financiero === 'ingreso' ? null : impactoData.categoria_movimiento,
                notas_pago: impactoData.notas_pago.trim().slice(0, 500) || null
            }
        }, {
            onSuccess: () => setModalImpactoOpen(false),
            onSettled: () => setGuardandoImpacto(false)
        });
    };

    const abrirModalAjuste = (pago) => {
        setAjusteData({ pago, nuevoMonto: String(Number(pago.monto) || ''), motivo: '' });
        setModalAjusteOpen(true);
    };

    const aplicarAjusteManual = () => {
        const pago = ajusteData.pago;
        const montoActual = Number(pago?.monto);
        const montoOriginal = Number(pago?.monto_original) || montoActual;
        const nuevoMonto = Number(ajusteData.nuevoMonto);
        const motivo = ajusteData.motivo.trim();

        if (!pago?.id) return toast.warning('No se encontró el pago seleccionado');
        if (!Number.isFinite(nuevoMonto) || nuevoMonto <= 0) return toast.warning('Ingresa un monto válido mayor a cero');
        if (nuevoMonto === montoActual) return toast.warning('El nuevo monto debe ser distinto al actual');
        if (!motivo) return toast.warning('Escribe el motivo del ajuste');

        const descuentoAplicado = nuevoMonto < montoOriginal ? montoOriginal - nuevoMonto : 0;
        const recargoAplicado = nuevoMonto > montoOriginal ? nuevoMonto - montoOriginal : 0;
        const tipo = nuevoMonto < montoActual ? 'Descuento' : 'Recargo';
        const notaAjuste = `${tipo}: monto modificado de $${montoActual.toLocaleString('es-AR')} a $${nuevoMonto.toLocaleString('es-AR')}. Motivo: ${motivo}`;
        const notasPrevias = String(pago.notas_pago || '').trim();
        const notasPago = [notasPrevias, notaAjuste].filter(Boolean).join('\n').slice(-500);

        setGuardandoAjuste(true);
        updatePagoMutation.mutate({
            id: pago.id,
            data: {
                monto_original: montoOriginal,
                monto: nuevoMonto,
                descuento_aplicado: descuentoAplicado,
                recargo_aplicado: recargoAplicado,
                tipo_descuento: descuentoAplicado > 0 ? motivo : null,
                notas_pago: notasPago
            }
        }, {
            onSuccess: () => {
                setModalAjusteOpen(false);
                setAjusteData({ pago: null, nuevoMonto: '', motivo: '' });
                toast.success(`Monto actualizado a $${nuevoMonto.toLocaleString('es-AR')}`);
            },
            onSettled: () => setGuardandoAjuste(false)
        });
    };

    const crearPlanDeCuotas = async () => {
        if (!planCuotasData.alumno_id || !planCuotasData.monto_total || !planCuotasData.fecha_primera_cuota) return toast.warning('Campos obligatorios');
        try {
            await pagosAPI.crearPlanCuotas(planCuotasData);
            queryClient.invalidateQueries(['pagos']);
            queryClient.invalidateQueries(['finanzas']);
            setModalPlanOpen(false);
            setPlanCuotasData({ alumno_id: '', concepto: 'Matrícula', descripcion: '', monto_total: '', cuotas: 3, fecha_primera_cuota: '' });
            toast.success(`Plan de ${planCuotasData.cuotas} cuotas creado exitosamente`);
        } catch (error) { toast.error('Error al crear plan de cuotas'); }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await pagosAPI.getAll({ page: 1, limit: 10000, estado: filtroEstado, mes: filtroMes, anio: filtroAnio, alumno_id: filtroAlumno, impacto: filtroImpacto });
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
                alumnos={alumnosOrdenados} filtroAlumno={filtroAlumno} setFiltroAlumno={setFiltroAlumno}
                filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
                filtroMes={filtroMes} setFiltroMes={setFiltroMes} filtroAnio={filtroAnio} setFiltroAnio={setFiltroAnio}
                filtroImpacto={filtroImpacto} setFiltroImpacto={setFiltroImpacto}
                limpiarFiltros={() => { setFiltroEstado('todos'); setFiltroMes(0); setFiltroAlumno(''); setFiltroImpacto('todos'); }}
                totalResults={stats.total || 0} filteredResults={totalItems || 0}
            />

            <PaymentTable
                pagos={pagos} verComprobante={verComprobante} descargarComprobante={descargarComprobante}
                rechazarComprobante={rechazarComprobante} abrirModalMetodoPago={abrirModalMetodoPago}
                abrirModalAjuste={abrirModalAjuste}
                abrirModalNota={abrirModalNota} calcularRecargoHandler={calcularRecargoHandler}
                abrirModalImpacto={abrirModalImpacto}
                subirComprobante={handleSubirComprobante}
            />

            {totalItems > 0 && <Pagination currentPage={page} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />}

            <PaymentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} tipoPagoActivo={tipoPagoActivo} setTipoPagoActivo={setTipoPagoActivo} alumnos={alumnosOrdenados} cursos={cursos} registrando={registrando} />
            <AdjustmentModal isOpen={modalAjusteOpen} onClose={() => setModalAjusteOpen(false)} ajusteData={ajusteData} setAjusteData={setAjusteData} aplicarAjusteManual={aplicarAjusteManual} guardando={guardandoAjuste} />
            <PaymentPlanModal isOpen={modalPlanOpen} onClose={() => setModalPlanOpen(false)} planCuotasData={planCuotasData} setPlanCuotasData={setPlanCuotasData} crearPlanDeCuotas={crearPlanDeCuotas} alumnos={alumnosOrdenados} />
            <PaymentMethodModal isOpen={modalMetodoPagoOpen} onClose={() => setModalMetodoPagoOpen(false)} metodoPagoSeleccionado={metodoPagoSeleccionado} setMetodoPagoSeleccionado={setMetodoPagoSeleccionado} confirmarPago={confirmarPago} metodoOtroTexto={metodoOtroTexto} setMetodoOtroTexto={setMetodoOtroTexto} fechaPago={fechaPago} setFechaPago={setFechaPago} />
            <PaymentNoteModal isOpen={modalNotaOpen} onClose={() => setModalNotaOpen(false)} pago={notaPago.pago} nota={notaPago.texto} setNota={(texto) => setNotaPago((actual) => ({ ...actual, texto }))} guardarNota={guardarNotaPago} guardando={guardandoNota} />
            <PaymentImpactModal isOpen={modalImpactoOpen} onClose={() => setModalImpactoOpen(false)} data={impactoData} setData={setImpactoData} onSave={guardarImpacto} saving={guardandoImpacto} />
            <ConfirmDialog isOpen={isOpen} onClose={closeConfirm} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} message={confirmConfig.message} variant={confirmConfig.variant} confirmText={confirmConfig.confirmText} cancelText={confirmConfig.cancelText} />
        </div>
    );
};

export default GestionPagos;
