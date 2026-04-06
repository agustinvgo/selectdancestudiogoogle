
const RecentActivity = ({ pagos }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pagos Recientes / Pendientes</h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <th className="pb-3 pl-2">Alumno</th>
                            <th className="pb-3">Concepto</th>
                            <th className="pb-3">Monto</th>
                            <th className="pb-3">Fecha Venc.</th>
                            <th className="pb-3 text-right pr-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {pagos.map((pago) => (
                            <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 pl-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {pago.alumno_nombre?.charAt(0)}{pago.alumno_apellido?.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {pago.alumno_nombre} {pago.alumno_apellido}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 text-sm text-gray-500">{pago.concepto}</td>
                                <td className="py-3 text-sm font-bold text-gray-700">${Math.round(pago.monto).toLocaleString('es-AR')}</td>
                                <td className="py-3 text-sm text-gray-500">
                                    {new Date(pago.fecha_vencimiento).toLocaleDateString()}
                                </td>
                                <td className="py-3 text-right pr-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${new Date(pago.fecha_vencimiento) < new Date()
                                            ? 'bg-red-100 text-red-600'
                                            : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {new Date(pago.fecha_vencimiento) < new Date() ? 'Vencido' : 'Pendiente'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {pagos.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                                    No hay pagos pendientes recientes
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivity;

