import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clasePruebaAPI, cursosAPI } from '../services/api';
import useToast from './useToast';
import Swal from 'sweetalert2';

const useClasesPrueba = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    // --- Queries: Solicitudes ---
    const { data: solicitudesData, isLoading: loadingSolicitudes } = useQuery({
        queryKey: ['solicitudes_prueba'],
        queryFn: async () => {
            const response = await clasePruebaAPI.getAll();
            return response.data.data || [];
        }
    });

    const solicitudes = (solicitudesData || []).filter(s =>
        (s.nombre && s.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.apellido && s.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- Queries: Disponibilidad y Cursos ---
    const { data: disponiblesData } = useQuery({
        queryKey: ['clases_prueba_disponibles'],
        queryFn: async () => {
            const response = await clasePruebaAPI.getDisponibles();
            return response.data.data || [];
        }
    });

    const { data: cursosData } = useQuery({
        queryKey: ['cursos'],
        queryFn: async () => {
            const response = await cursosAPI.getAll();
            return response.data.data || [];
        }
    });

    const disponibles = disponiblesData || [];
    const cursos = cursosData || [];

    // --- Mutations: Solicitudes ---
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, newStatus }) => clasePruebaAPI.updateStatus(id, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries(['solicitudes_prueba']);
            toast.success('Estado actualizado');
        },
        onError: (error) => {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar estado');
        }
    });

    const deleteSolicitudMutation = useMutation({
        mutationFn: (id) => clasePruebaAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['solicitudes_prueba']);
            toast.success('Solicitud eliminada');
        },
        onError: (error) => {
            console.error('Error deleting request:', error);
            toast.error('Error al eliminar solicitud');
        }
    });

    const handleStatusChange = (id, newStatus) => {
        updateStatusMutation.mutate({ id, newStatus });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            deleteSolicitudMutation.mutate(id);
        }
    };

    // --- Mutations: Disponibilidad ---
    const addSlotMutation = useMutation({
        mutationFn: (data) => clasePruebaAPI.addDisponibilidad(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['clases_prueba_disponibles']);
            toast.success('Horario agregado');
        },
        onError: (error) => {
            console.error('Error adding slot:', error);
            toast.error('Error al agregar horario');
        }
    });

    const deleteSlotMutation = useMutation({
        mutationFn: (id) => clasePruebaAPI.deleteDisponibilidad(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['clases_prueba_disponibles']);
            toast.success('Horario eliminado');
        },
        onError: (error) => {
            console.error('Error deleting slot:', error);
            toast.error('Error al eliminar');
        }
    });

    const handleDeleteSlot = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro de eliminar este horario?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            deleteSlotMutation.mutate(id);
        }
    };

    return {
        // Solicitudes State & Actions
        solicitudes,
        loadingSolicitudes,
        searchTerm,
        setSearchTerm,
        handleStatusChange,
        handleDelete,
        updateStatusPending: updateStatusMutation.isPending,
        deleteSolicitudPending: deleteSolicitudMutation.isPending,
        
        // Disponibilidad State & Actions
        disponibles,
        cursos,
        addSlotMutation,
        handleDeleteSlot,
        toast
    };
};

export default useClasesPrueba;
