import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastosAPI } from '../services/api';
import useToast from './useToast';
import Swal from 'sweetalert2';

const useGastos = ({ mes, anio, categoriaFiltro }) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    // 1. Fetch Gastos
    const { data: gastosData, isLoading } = useQuery({
        queryKey: ['gastos', mes, anio, categoriaFiltro],
        queryFn: async () => {
            const response = await gastosAPI.getAll({ mes, anio, categoria: categoriaFiltro });
            return response.data.data || [];
        }
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (data) => gastosAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['gastos']);
            toast.success('Gasto registrado correctamente');
        },
        onError: (error) => {
            console.error('Error creating expense:', error);
            toast.error('Error al guardar el gasto');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => gastosAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['gastos']);
            toast.success('Gasto actualizado correctamente');
        },
        onError: (error) => {
            console.error('Error updating expense:', error);
            toast.error('Error al actualizar el gasto');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => gastosAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['gastos']);
            toast.success('Gasto eliminado');
        },
        onError: (error) => {
            console.error('Error deleting expense:', error);
            toast.error('Error al eliminar');
        }
    });

    const uploadComprobanteMutation = useMutation({
        mutationFn: ({ id, formData }) => gastosAPI.update(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['gastos']);
            toast.success('Comprobante subido exitosamente');
        },
        onError: (error) => {
            console.error('Error uploading comprobante:', error);
            toast.error('Error al subir comprobante');
        }
    });

    const deleteGastoWithConfirm = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    return {
        gastos: gastosData || [],
        isLoading,
        createMutation,
        updateMutation,
        deleteGastoWithConfirm,
        uploadComprobanteMutation,
        toast
    };
};

export default useGastos;
