import { PencilIcon, TrashIcon, ShoppingBagIcon, ExclamationTriangleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InventarioCard = ({
    prod,
    openEditModal,
    handleDelete,
    openSaleModal,
    openGroupModal
}) => {
    return (
        <div className="card bg-white border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="card-body p-5 flex flex-col h-full">
                <div className="relative aspect-video bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-100 group-hover:border-blue-100 transition-colors">
                    {prod.imagen_url ? (
                        <img
                            src={prod.imagen_url.startsWith('http') ? prod.imagen_url : `${API_URL.replace('/api', '')}${prod.imagen_url}`}
                            alt={prod.nombre}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBagIcon className="w-12 h-12" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg p-1 shadow-sm backdrop-blur-sm">
                        {!prod.isGroup && (
                            <>
                                <button onClick={() => openEditModal(prod)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm">
                            {prod.categoria || 'General'}
                        </span>
                    </div>
                </div>

                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{prod.nombre}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 min-h-[2.5rem] mb-4">
                        {prod.descripcion || 'Sin descripción disponible.'}
                    </p>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Precio</p>
                        <p className="text-2xl font-black text-gray-900 tracking-tight">
                            {prod.isGroup && prod.minPrice !== prod.maxPrice
                                ? `$${prod.minPrice.toLocaleString('es-AR')} - $${prod.maxPrice.toLocaleString('es-AR')}`
                                : `$${parseFloat(prod.precio_venta || prod.minPrice).toLocaleString('es-AR')} `
                            }
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Stock Total</p>
                        <div className={`flex items-center justify-end gap-1 font-bold ${prod.stock_actual <= prod.stock_minimo ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full' : 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full'}`}>
                            {prod.stock_actual <= prod.stock_minimo && <ExclamationTriangleIcon className="w-3 h-3" />}
                            <span className="text-sm">{prod.stock_actual} {prod.isGroup && 'unid.'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => openSaleModal(prod)}
                        disabled={prod.stock_actual <= 0}
                        className="flex-1 mt-4 py-2.5 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <MinusIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span>Vender</span>
                    </button>

                    {prod.isGroup && (
                        <button
                            onClick={() => openGroupModal(prod)}
                            className="mt-4 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Tallas</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventarioCard;
