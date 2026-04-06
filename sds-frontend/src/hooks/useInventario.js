import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeAPI } from '../services/api';
import useToast from './useToast';
import Swal from 'sweetalert2';

const useInventario = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    // 1. Fetch Productos
    const { data: productosData, isLoading } = useQuery({
        queryKey: ['productos'],
        queryFn: async () => {
            const response = await storeAPI.getProductos();
            return response.data.data || [];
        }
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (data) => storeAPI.createProducto(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos']);
        },
        onError: (error) => {
            console.error('Error creating product:', error);
            toast.error('Error al crear producto');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => storeAPI.updateProducto(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos']);
        },
        onError: (error) => {
            console.error('Error updating product:', error);
            toast.error('Error al actualizar producto');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => storeAPI.deleteProducto(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos']);
            toast.success('Producto eliminado');
        },
        onError: (error) => {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar');
        }
    });

    const saleMutation = useMutation({
        mutationFn: (data) => storeAPI.registrarVentaRapida(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['productos']);
            toast.success('Venta registrada');
        },
        onError: (error) => {
            console.error('Error registering sale:', error);
            toast.error('Error al registrar venta');
        }
    });

    const deleteProductWithConfirm = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar producto?',
            text: "Se marcará como inactivo pero no se borrará el historial.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    return {
        productos: productosData || [],
        isLoading,
        createMutation,
        updateMutation,
        saleMutation,
        deleteProductWithConfirm,
        toast
    };
};

export default useInventario;
