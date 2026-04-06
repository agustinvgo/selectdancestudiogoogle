import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentAttendanceChart = ({ data }) => {
    // data esperada: [{ mes: '2024-01', porcentaje: 85, total_clases: 8, presentes: 7 }]

    const chartData = data || [];

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No hay historial de asistencia suficiente
            </div>
        );
    }

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Mi Asistencia (Últimos 6 Meses)</h3>
            </div>
            <div className="card-body">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorAsistenciaStudent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="mes"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                tickFormatter={(value) => value.substring(5)} // '01', '02'
                            />
                            <YAxis
                                domain={[0, 100]}
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                formatter={(value, name) => [
                                    name === 'porcentaje' ? `${value}%` : value,
                                    name === 'porcentaje' ? 'Asistencia' : name
                                ]}
                                labelFormatter={(label) => `Mes: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="porcentaje"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorAsistenciaStudent)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceChart;

