import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DemographicsChart = ({ data }) => {
    // data: [{ rango_edad: '0-5', cantidad: 15 }, ...]

    const COLORS = ['#60A5FA', '#34D399', '#A78BFA', '#F472B6', '#FBBF24'];

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Demografía (Edades)</h3>
            </div>
            <div className="card-body">
                <div className="h-64 w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="rango_edad"
                                    type="category"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF' }}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No hay datos demográficos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemographicsChart;

