import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PaymentChart = ({ data }) => {
    // Transformar datos de métodos de pago
    const chartData = (data || []).map(item => ({
        ...item,
        total: parseFloat(item.total)
    }));

    // Colores modernos y profesionales
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos de pagos disponibles
            </div>
        );
    }

    return (
        <div className="card h-full">
            <div className="card-header border-b border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
            </div>
            <div className="card-body">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="total"
                                nameKey="metodo"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                                formatter={(value) => `$${value.toLocaleString('es-AR')}`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-gray-600">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PaymentChart;

