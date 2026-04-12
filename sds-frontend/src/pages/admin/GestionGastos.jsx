import { useState, useRef } from 'react';
import useGastos from '../../hooks/useGastos';
import { gastosAPI } from '../../services/api';
import { PlusIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';

import GastoFormModal from '../../components/admin/gastos/GastoFormModal';
import PreviewModal from '../../components/admin/gastos/PreviewModal';
import GastosTabla from '../../components/admin/gastos/GastosTabla';

const GestionGastos = () => {
    // 1. Filtros UI State
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const categorias = ['Alquiler', 'Sueldos', 'Servicios', 'Mantenimiento', 'Insumos', 'Marketing', 'Impuestos', 'Otros'];
    const years = [2024, 2025, 2026, 2027];

    // 2. Custom Hook para el Backend Core
    const {
        gastos: gastosApiData,
        isLoading,
        createMutation,
        updateMutation,
        deleteGastoWithConfirm,
        uploadComprobanteMutation,
        toast
    } = useGastos({ mes, anio, categoriaFiltro });

    // 3. UI Local State
    const [showModal, setShowModal] = useState(false);
    const [editingGasto, setEditingGasto] = useState(null);
    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split('T')[0],
        monto: '', categoria: '', descripcion: '', comprobante: null
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState('image');
    
    const gastoFileInputRef = useRef(null);
    const [uploadingGastoId, setUploadingGastoId] = useState(null);

    // 4. Dato Filtrado Local
    const gastos = gastosApiData.filter(g =>
        (g.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalGastos = gastos.reduce((acc, curr) => acc + parseFloat(curr.monto), 0);

    // 5. Handlers
    const resetForm = () => {
        setFormData({ fecha: new Date().toISOString().split('T')[0], monto: '', categoria: '', descripcion: '', comprobante: null });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('fecha', formData.fecha);
        data.append('monto', formData.monto);
        data.append('categoria', formData.categoria);
        data.append('descripcion', formData.descripcion);
        if (formData.comprobante) data.append('comprobante', formData.comprobante);

        if (editingGasto) {
            updateMutation.mutate({ id: editingGasto.id, data }, { onSuccess: () => { setShowModal(false); setEditingGasto(null); resetForm(); }});
        } else {
            createMutation.mutate(data, { onSuccess: () => { setShowModal(false); resetForm(); }});
        }
    };

    // Subida de Comprobante rápida
    const handleUploadComprobanteClick = (gastoId) => {
        setUploadingGastoId(gastoId);
        if (gastoFileInputRef.current) {
            gastoFileInputRef.current.value = '';
            gastoFileInputRef.current.click();
        }
    };

    const handleGastoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingGastoId) return;
        const fmData = new FormData();
        fmData.append('comprobante', file);
        uploadComprobanteMutation.mutate({ id: uploadingGastoId, formData: fmData }, { onSuccess: () => setUploadingGastoId(null), onError: () => setUploadingGastoId(null) });
    };

    const handleVerComprobante = async (gastoId) => {
        try {
            const response = await gastosAPI.verArchivoComprobante(gastoId);
            const contentType = response.headers['content-type'] || 'image/jpeg';
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            setPreviewType(contentType.includes('pdf') ? 'pdf' : 'image');
            setPreviewUrl(url);
        } catch (error) {
            toast.error('No se pudo abrir el comprobante');
        }
    };

    const handleExportExcel = async () => {
        const XLSX = await import('xlsx');
        const dataToExport = gastos.map(g => ({
            Fecha: new Date(g.fecha).toLocaleDateString(),
            Categoría: g.categoria,
            Descripción: g.descripcion,
            Monto: parseFloat(g.monto),
            Comprobante: g.comprobante_url ? 'Sí' : 'No'
        }));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Gastos");
        XLSX.writeFile(wb, `Gastos_${mes}_${anio}.xlsx`);
    };

    const openEditModal = (gasto) => {
        setEditingGasto(gasto);
        setFormData({ fecha: gasto.fecha.split('T')[0], monto: gasto.monto, categoria: gasto.categoria, descripcion: gasto.descripcion || '' });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <input type="file" ref={gastoFileInputRef} onChange={handleGastoFileChange} accept="image/*,.pdf" className="hidden" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
                    <p className="text-gray-500">Registra y controla los egresos del estudio</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportExcel} disabled={gastos.length === 0} className="btn bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2 border border-gray-700">
                        <ArrowDownTrayIcon className="w-5 h-5" /> Exportar Excel
                    </button>
                    <button onClick={() => { resetForm(); setEditingGasto(null); setShowModal(true); }} className="btn bg-white hover:bg-gray-200 text-black flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Registrar Gasto
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card md:col-span-3">
                    <div className="card-body p-4 flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2"><FunnelIcon className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-600">Filtros:</span></div>
                        <select value={mes} onChange={(e) => setMes(e.target.value)} className="bg-white border-gray-200 rounded-lg text-gray-900 text-sm">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('es-AR', { month: 'long' })}</option>)}
                        </select>
                        <select value={anio} onChange={(e) => setAnio(e.target.value)} className="bg-white border-gray-200 rounded-lg text-gray-900 text-sm">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="bg-white border-gray-200 rounded-lg text-gray-900 text-sm">
                            <option value="">Todas</option>
                            {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <div className="relative flex-1 min-w-[200px]">
                            <input type="text" placeholder="Buscar concepto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>

                <div className="card bg-white border border-gray-200">
                    <div className="card-body p-4">
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Gastos</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">${totalGastos.toLocaleString('es-AR')}</p>
                    </div>
                </div>
            </div>

            {/* Listado de Gastos Modularizado */}
            <GastosTabla 
                isLoading={isLoading} gastos={gastos} 
                handleVerComprobante={handleVerComprobante} 
                handleUploadComprobante={handleUploadComprobanteClick} 
                uploadingGastoId={uploadingGastoId}
                openEditModal={openEditModal} handleDelete={deleteGastoWithConfirm} 
            />

            {/* Modales Modularizados */}
            <GastoFormModal 
                showModal={showModal} setShowModal={setShowModal} editingGasto={editingGasto} 
                formData={formData} setFormData={setFormData} handleSubmit={handleFormSubmit} 
                isPending={createMutation.isPending || updateMutation.isPending} categorias={categorias}
            />

            <PreviewModal previewUrl={previewUrl} previewType={previewType} setPreviewUrl={setPreviewUrl} />
        </div>
    );
};

export default GestionGastos;
