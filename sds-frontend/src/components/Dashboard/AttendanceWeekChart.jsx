import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceWeekChart = ({ data }) => {
    // data: [{ dia_nombre: 'Lunes', porcentaje_asistencia: 88.5 }, ...]

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Patrones de Asistencia (Semanal)</h3>
            </div>
            <div className="card-body">
                <div className="h-64 w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="dia_nombre"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(val) => val.substring(0, 3)} // Lun, Mar, etc.
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    domain={[0, 100]}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    formatter={(value) => [`${value}%`, 'Asistencia Promedio']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey={(row) => parseFloat(row.porcentaje_asistencia)}
                                    // dataKey="porcentaje_asistencia" 
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#F59E0B' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Faltan datos de asistencia
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceWeekChart;

