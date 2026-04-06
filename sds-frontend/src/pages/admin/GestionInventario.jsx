import { useState, useEffect } from 'react';
import useInventario from '../../hooks/useInventario';
import Loader from '../../components/Loader';
import { PlusIcon } from '@heroicons/react/24/outline';

import InventarioCard from '../../components/admin/inventario/InventarioCard';
import InventarioFormModal from '../../components/admin/inventario/InventarioFormModal';
import VentaRapidaModal from '../../components/admin/inventario/VentaRapidaModal';
import TallasModal from '../../components/admin/inventario/TallasModal';

const GestionInventario = () => {
    // 1. Hook & API Data
    const {
        productos: productosApi,
        isLoading,
        createMutation,
        updateMutation,
        saleMutation,
        deleteProductWithConfirm
    } = useInventario();

    // 2. UI State
    const [showModal, setShowModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [saleProduct, setSaleProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // 3. Forms Data
    const categorias = ['Ropa', 'Calzado', 'Bebidas', 'Accesorios', 'Otros'];
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', precio_costo: '', precio_venta: '',
        stock_actual: '', stock_minimo: 5, categoria: '', imagen: null
    });
    const [saleData, setSaleData] = useState({
        cantidad: 1, metodo_pago: 'Efectivo', selectedVariantId: '', precio_final: 0
    });

    // 4. Data Derivation (Filters & Grouping)
    const filteredProductos = (productosApi || []).filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const groupedProductos = filteredProductos.reduce((acc, current) => {
        const variantMatch = current.nombre.match(/(.*)\s(talla|talle)\s(\S+)$/i);
        if (variantMatch) {
            const baseName = variantMatch[1].trim();
            const variantType = variantMatch[2].toLowerCase();
            const variantValue = variantMatch[3];
            const existingGroupIndex = acc.findIndex(p => p.isGroup && p.nombre.toLowerCase() === baseName.toLowerCase());

            if (existingGroupIndex >= 0) {
                const group = acc[existingGroupIndex];
                group.stock_actual += parseInt(current.stock_actual);
                group.variants.push({ ...current, variantValue, variantType });
                const currentPrice = parseFloat(current.precio_venta);
                if (currentPrice < group.minPrice) group.minPrice = currentPrice;
                if (currentPrice > group.maxPrice) group.maxPrice = currentPrice;
            } else {
                acc.push({
                    id: `group-${current.id}`, isGroup: true, nombre: baseName,
                    descripcion: current.descripcion, categoria: current.categoria,
                    imagen_url: current.imagen_url, stock_actual: parseInt(current.stock_actual),
                    stock_minimo: current.stock_minimo, minPrice: parseFloat(current.precio_venta),
                    maxPrice: parseFloat(current.precio_venta),
                    variants: [{ ...current, variantValue, variantType }]
                });
            }
        } else {
            acc.push({ ...current, isGroup: false });
        }
        return acc;
    }, []);

    // 5. Handlers
    const resetForm = () => {
        setFormData({
            nombre: '', descripcion: '', precio_costo: '', precio_venta: '',
            stock_actual: '', stock_minimo: 5, categoria: '', imagen: null
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'imagen' && !formData[key]) return;
            data.append(key, formData[key]);
        });

        if (editingProducto) {
            updateMutation.mutate({ id: editingProducto.id, data }, {
                onSuccess: () => { setShowModal(false); setEditingProducto(null); resetForm(); }
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => { setShowModal(false); resetForm(); }
            });
        }
    };

    const handleSaleSubmit = (e) => {
        e.preventDefault();
        let targetId = saleProduct.id;
        let pVenta = saleProduct.precio_venta;
        
        if (saleProduct.isGroup) {
            targetId = saleData.selectedVariantId;
            const targetVariant = saleProduct.variants?.find(v => v.id == targetId);
            if(targetVariant) pVenta = targetVariant.precio_venta;
        }

        saleMutation.mutate({
            producto_id: targetId, cantidad: saleData.cantidad,
            precio_venta: pVenta, precio_final: saleData.precio_final,
            metodo_pago: saleData.metodo_pago
        }, {
            onSuccess: () => { setShowSaleModal(false); setSaleProduct(null); }
        });
    };

    const openEditModal = (prod) => {
        setEditingProducto(prod);
        setFormData({
            nombre: prod.nombre, descripcion: prod.descripcion, precio_costo: prod.precio_costo,
            precio_venta: prod.precio_venta, stock_actual: prod.stock_actual,
            stock_minimo: prod.stock_minimo, categoria: prod.categoria, imagen: null
        });
        setShowModal(true);
    };

    const openSaleModal = (producto) => {
        setSaleProduct(producto);
        const defaultVarId = producto.isGroup && producto.variants?.length > 0 ? producto.variants[0].id : producto.id;
        const defaultPrice = producto.isGroup && producto.variants?.length > 0 ? producto.variants[0].precio_venta : producto.precio_venta;
        setSaleData({ cantidad: 1, metodo_pago: 'Efectivo', selectedVariantId: defaultVarId, precio_final: defaultPrice });
        setShowSaleModal(true);
    };

    useEffect(() => {
        if (showSaleModal && saleProduct) {
            let currentPrice = saleProduct.precio_venta;
            if (saleProduct.isGroup) {
                const activeVariant = saleProduct.variants?.find(v => v.id == saleData.selectedVariantId);
                if (activeVariant) currentPrice = activeVariant.precio_venta;
            }
            setSaleData(prev => ({ ...prev, precio_final: currentPrice * prev.cantidad }));
        }
    }, [saleData.cantidad, saleData.selectedVariantId, saleProduct, showSaleModal]);

    const openNewVariantModal = (group) => {
        setShowGroupModal(false);
        resetForm();
        setFormData(prev => ({
            ...prev, nombre: `${group.nombre} talla `, precio_venta: group.minPrice,
            categoria: group.categoria, descripcion: group.descripcion
        }));
        setEditingProducto(null);
        setShowModal(true);
    };

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
                    <p className="text-gray-500">Control de stock y ventas rápidas</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="text" placeholder="Buscar producto..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none w-full sm:w-64"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingProducto(null); setShowModal(true); }}
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedProductos.map(prod => (
                    <InventarioCard 
                        key={prod.id} prod={prod} 
                        openEditModal={openEditModal} handleDelete={deleteProductWithConfirm} 
                        openSaleModal={openSaleModal} openGroupModal={(p) => { setSelectedGroup(p); setShowGroupModal(true); }} 
                    />
                ))}
            </div>

            <InventarioFormModal
                showModal={showModal} setShowModal={setShowModal} editingProducto={editingProducto}
                formData={formData} setFormData={setFormData} handleSubmit={handleFormSubmit}
                isPending={createMutation.isPending || updateMutation.isPending} categorias={categorias}
            />

            <VentaRapidaModal
                showSaleModal={showSaleModal} setShowSaleModal={setShowSaleModal} saleProduct={saleProduct}
                saleData={saleData} setSaleData={setSaleData} handleSaleSubmit={handleSaleSubmit}
                isPending={saleMutation.isPending}
            />

            <TallasModal
                showGroupModal={showGroupModal} setShowGroupModal={setShowGroupModal} selectedGroup={selectedGroup}
                handleEditFromGroup={(variant) => { setShowGroupModal(false); openEditModal(variant); }} 
                handleDelete={deleteProductWithConfirm} openNewVariantModal={openNewVariantModal}
            />
        </div>
    );
};

export default GestionInventario;
