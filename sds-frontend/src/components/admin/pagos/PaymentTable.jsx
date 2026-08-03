import { useState, useRef } from 'react';
import { EyeIcon, ArrowDownTrayIcon, XCircleIcon, CheckCircleIcon, CurrencyDollarIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, ArrowUpTrayIcon, TagIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../../StatusBadge';
import SortableTableHeader from '../../SortableTableHeader';
import useTableSort from '../../../hooks/useTableSort';
import { formatPaymentPeriod } from '../../../utils/paymentPeriod';

const PaymentTable = ({
    pagos: initialPagos,
    verComprobante,
    descargarComprobante,
    rechazarComprobante,
    abrirModalMetodoPago,
    abrirModalAjuste,
    abrirModalNota,
    abrirModalImpacto,
    calcularRecargoHandler,
    subirComprobante
}) => {
    const fileInputRef = useRef(null);
    const [uploadingPagoId, setUploadingPagoId] = useState(null);

    const handleUploadClick = (pagoId) => {
        setUploadingPagoId(pagoId);
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingPagoId) return;
        await subirComprobante(uploadingPagoId, file);
        setUploadingPagoId(null);
    };
    // Apply sorting
    const { sortedData: pagos, sortColumn, sortDirection, handleSort } = useTableSort(
        initialPagos,
        'fecha_vencimiento',
        'desc'
    );

    const ImpactBadge = ({ pago }) => {
        const impacto = pago.impacto_financiero || 'ingreso';
        if (impacto === 'ingreso') return <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Ingreso</span>;
        if (impacto === 'ajuste') return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Ajuste · no computable</span>;
        return <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Informativo</span>;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Hidden file input for admin receipt upload */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
            />
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-base font-semibold text-gray-900">
                    Transacciones ({pagos.length})
                </h2>
            </div>

            <div className="p-0">
                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {pagos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                            No se encontraron pagos
                        </div>
                    ) : (
                        pagos.map((pago) => (
                            <div key={pago.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            {pago.alumno_nombre} {pago.alumno_apellido}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{pago.concepto}</p>
                                        <div className="mt-1"><ImpactBadge pago={pago} /></div>
                                        {pago.notas_pago && (
                                            <p className="mt-1 max-w-[220px] truncate text-xs text-indigo-600" title={pago.notas_pago}>
                                                Nota: {pago.notas_pago}
                                            </p>
                                        )}
                                    </div>
                                    <StatusBadge status={pago.estado} />
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-2.5">
                                    <div>
                                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Monto</span>
                                        <span className="text-gray-900 font-bold">${Math.round(pago.monto || 0).toLocaleString('es-AR')}</span>
                                    </div>
                                    <div className="border-l border-gray-200 pl-3">
                                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Período</span>
                                        <span className="text-gray-700 font-medium">{formatPaymentPeriod(pago.fecha_vencimiento)}</span>
                                    </div>
                                    <div className="border-l border-gray-200 pl-3">
                                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider">Vence</span>
                                        <span className="text-gray-700 font-medium">{pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-1 border-t border-gray-100 pt-3">
                                    <button
                                        onClick={() => abrirModalNota(pago)}
                                        className={`rounded-lg p-2 ${pago.notas_pago ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={pago.notas_pago ? 'Editar Nota' : 'Agregar Nota'}
                                    >
                                        <DocumentTextIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => abrirModalImpacto(pago)}
                                        className={`rounded-lg p-2 ${(pago.impacto_financiero || 'ingreso') !== 'ingreso' ? 'bg-amber-50 text-amber-700' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title="Clasificar impacto"
                                    >
                                        <TagIcon className="h-4 w-4" />
                                    </button>
                                    {pago.comprobante_url && (
                                        <button
                                            onClick={() => verComprobante(pago.id)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                                            title="Ver Comprobante"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </button>
                                    )}

                                    {pago.estado === 'pagado' && (pago.impacto_financiero || 'ingreso') === 'ingreso' && (
                                        <button
                                            onClick={() => descargarComprobante(pago.id)}
                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                                            title="Descargar Comprobante"
                                        >
                                            <ArrowDownTrayIcon className="h-4 w-4" />
                                        </button>
                                    )}

                                    {pago.estado !== 'pagado' && (pago.impacto_financiero || 'ingreso') === 'ingreso' && (
                                        <>
                                            {subirComprobante && (
                                                <button
                                                    onClick={() => handleUploadClick(pago.id)}
                                                    className={`p-2 rounded-lg ${uploadingPagoId === pago.id ? 'text-amber-600 bg-amber-50 animate-pulse' : 'text-purple-600 hover:bg-purple-50'}`}
                                                    title="Subir Comprobante"
                                                    disabled={uploadingPagoId === pago.id}
                                                >
                                                    <ArrowUpTrayIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => abrirModalMetodoPago(pago.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Marcar Pagado"
                                            >
                                                <CheckCircleIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => abrirModalAjuste(pago)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                title="Ajustar Monto"
                                            >
                                                <CurrencyDollarIcon className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <SortableTableHeader
                                    column="alumno_nombre"
                                    label="Alumno"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    column="concepto"
                                    label="Concepto"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Período
                                </th>
                                <SortableTableHeader
                                    column="monto"
                                    label="Monto"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                    className="text-right"
                                />
                                <SortableTableHeader
                                    column="fecha_vencimiento"
                                    label="Vencimiento"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    column="estado"
                                    label="Estado"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                    onSort={handleSort}
                                />
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pagos.map((pago) => (
                                <tr key={pago.id} className="hover:bg-white transition-colors">
                                    <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                                        {pago.alumno_nombre} {pago.alumno_apellido}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        <p className="whitespace-nowrap">{pago.concepto}</p>
                                        <div className="mt-1"><ImpactBadge pago={pago} /></div>
                                        {pago.categoria_movimiento && (
                                            <p className="mt-1 text-[11px] font-medium text-amber-700">Categoría: {pago.categoria_movimiento.replaceAll('_', ' ')}</p>
                                        )}
                                        {pago.notas_pago && (
                                            <p className="mt-1 max-w-[260px] truncate text-xs text-indigo-600" title={pago.notas_pago}>
                                                Nota: {pago.notas_pago}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {formatPaymentPeriod(pago.fecha_vencimiento)}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">
                                        ${Math.round(pago.monto || 0).toLocaleString('es-AR')}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={pago.estado} />
                                    </td>
                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                        <div className="flex justify-end items-center gap-1">
                                            {/* Action buttons wrapper */}
                                            {pago.comprobante_url && (
                                                <button
                                                    onClick={() => verComprobante(pago.id)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver Comprobante"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            )}

                                            {pago.estado === 'pagado' && (pago.impacto_financiero || 'ingreso') === 'ingreso' && (
                                                <button
                                                    onClick={() => descargarComprobante(pago.id)}
                                                    className="p-1.5 text-gray-400 hover:text-zinc-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Descargar Comprobante"
                                                >
                                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            {pago.estado !== 'pagado' && (pago.impacto_financiero || 'ingreso') === 'ingreso' && (
                                                <>
                                                    {pago.estado === 'revision' && (
                                                        <button
                                                            onClick={() => rechazarComprobante(pago.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Rechazar Comprobante"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {subirComprobante && (
                                                        <button
                                                            onClick={() => handleUploadClick(pago.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${uploadingPagoId === pago.id ? 'text-amber-600 bg-amber-50 animate-pulse' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                                                            title="Subir Comprobante"
                                                            disabled={uploadingPagoId === pago.id}
                                                        >
                                                            <ArrowUpTrayIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => abrirModalMetodoPago(pago.id)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Marcar Pagado"
                                                    >
                                                        <CheckCircleIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalAjuste(pago)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Ajustar Monto"
                                                    >
                                                        <CurrencyDollarIcon className="h-5 w-5" />
                                                    </button>
                                                    {pago.estado === 'vencido' && (
                                                        <button
                                                            onClick={() => calcularRecargoHandler(pago.id)}
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Calcular Recargo"
                                                        >
                                                            <DocumentTextIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {pago.estado !== 'pagado' && (pago.impacto_financiero || 'ingreso') === 'ingreso' && pago.alumno_telefono && (
                                                <a
                                                    href={`https://wa.me/${pago.alumno_telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${pago.alumno_nombre}, te recordamos que tienes un pago pendiente de $${pago.monto} correspondiente a ${pago.concepto}. Fecha vto: ${new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}.`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Enviar Recordatorio WhatsApp"
                                                >
                                                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => abrirModalNota(pago)}
                                                className={`rounded-lg p-1.5 transition-colors ${pago.notas_pago ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                                title={pago.notas_pago ? 'Editar Nota' : 'Agregar Nota'}
                                            >
                                                <DocumentTextIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => abrirModalImpacto(pago)}
                                                className={`rounded-lg p-1.5 transition-colors ${(pago.impacto_financiero || 'ingreso') !== 'ingreso' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                                title="Clasificar impacto"
                                            >
                                                <TagIcon className="h-5 w-5" />
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
    );
};

export default PaymentTable;


