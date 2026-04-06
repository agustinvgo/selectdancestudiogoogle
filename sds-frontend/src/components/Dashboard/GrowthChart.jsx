import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GrowthChart = ({ data }) => {
    // data: [{ mes: '2024-01', nuevos_alumnos: 5 }, ...]

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Crecimiento de Alumnos</h3>
            </div>
            <div className="card-body">
                <div className="h-64 w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis
                                    dataKey="mes"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    tickFormatter={(value) => value.substring(5)}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    formatter={(value) => [value, 'Nuevos Alumnos']}
                                />
                                <Bar dataKey="nuevos_alumnos" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No hay datos recientes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrowthChart;

