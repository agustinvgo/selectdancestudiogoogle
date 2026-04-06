import { UserGroupIcon, UserIcon, UserMinusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const StudentStats = ({ stats }) => {
    const { activos = 0, inactivos = 0, todos = 0 } = stats || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Alumnos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Alumnos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{todos}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Activos */}
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Activos</p>
                        <p className="text-3xl font-bold text-green-700 mt-2">{activos}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Inactivos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inactivos</p>
                        <p className="text-3xl font-bold text-gray-600 mt-2">{inactivos}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <XCircleIcon className="h-8 w-8 text-gray-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentStats;

