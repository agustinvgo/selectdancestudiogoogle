/**
 * @file AdminDashboard.jsx
 * @description Vista raíz del panel de administradores. 
 * Funciona como HUB inicial para que el administrador acceda a la gestión general.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    Panel de Administración
                </h1>
                <p className="text-gray-400 mt-1">
                    Bienvenido, {user?.email}
                </p>
            </div>

            {/* Mensaje temporal */}
            <div className="card">
                <div className="card-body">
                    <p className="text-white">
                        Dashboard temporal - Los datos se están cargando correctamente.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
