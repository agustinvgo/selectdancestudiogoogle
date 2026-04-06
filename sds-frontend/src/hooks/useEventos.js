import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventosAPI, alumnosAPI } from '../services/api';
import useToast from './useToast';

const useEventos = ({ expandedEventoId, eventoSeleccionado, modalDetalleOpen }) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    // 1. Queries
    const { data: eventosData, isLoading: isLoadingEventos } = useQuery({
        queryKey: ['eventos'],
        queryFn: async () => {
            const response = await eventosAPI.getAll();
            return response.data.data || [];
        }
    });

    const { data: alumnosData, isLoading: isLoadingAlumnos } = useQuery({
        queryKey: ['alumnos'],
        queryFn: async () => {
            const response = await alumnosAPI.getAll();
            return response.data.data || [];
        }
    });

    const { data: eventoDetalleData, isLoading: isLoadingDetalle } = useQuery({
        queryKey: ['evento', expandedEventoId || eventoSeleccionado?.id],
        queryFn: async () => {
            const id = expandedEventoId || eventoSeleccionado?.id;
            if (!id) return null;
            const response = await eventosAPI.getById(id);
            return response.data.data;
        },
        enabled: !!(expandedEventoId || (eventoSeleccionado && modalDetalleOpen)),
    });

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (data) => eventosAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['eventos']);
            toast.success('Evento creado exitosamente');
        },
        onError: (error) => {
            console.error('Error creating event:', error);
            toast.error(error.response?.data?.message || 'Error al crear evento');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => eventosAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['eventos']);
            toast.success('Evento actualizado exitosamente');
        },
        onError: (error) => {
            console.error('Error updating event:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar evento');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => eventosAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['eventos']);
            toast.success('Evento eliminado correctamente');
        },
        onError: (error) => {
            console.error('Error deleting event:', error);
            toast.error('Error al eliminar evento');
        }
    });

    const inscribirMutation = useMutation({
        mutationFn: ({ eventoId, alumnoId }) => eventosAPI.inscribirAlumno(eventoId, { alumno_id: alumnoId }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['evento', variables.eventoId]);
            queryClient.invalidateQueries(['eventos']); // Update count
            toast.success('Alumno inscrito exitosamente');
        },
        onError: (error) => {
            console.error('Error inscribing student:', error);
            toast.error(error.response?.data?.message || 'Error al inscribir alumno');
        }
    });

    const desinscribirMutation = useMutation({
        mutationFn: ({ eventoId, inscripcionId }) => eventosAPI.desinscribirAlumno(eventoId, inscripcionId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['evento', variables.eventoId]);
            queryClient.invalidateQueries(['eventos']); // Update count
            toast.success('Alumno eliminado del evento exitosamente');
        },
        onError: (error) => {
            console.error('Error desinscribing student:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar inscripción');
        }
    });

    const updatePaymentMutation = useMutation({
        mutationFn: ({ eventoId, inscripcionId, pagoRealizado }) =>
            eventosAPI.updateChecklist(eventoId, inscripcionId, { pago_realizado: !pagoRealizado }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['evento', variables.eventoId]);
            toast.success(variables.pagoRealizado ? 'Marcado como no pagado' : 'Marcado como pagado');
        },
        onError: (error) => {
            console.error('Error updating payment:', error);
            toast.error('Error al actualizar estado de pago');
        }
    });

    return {
        eventos: eventosData || [],
        alumnos: alumnosData || [],
        eventoDetalle: eventoDetalleData || null,
        isLoading: isLoadingEventos || isLoadingAlumnos,
        loadingParticipantes: isLoadingDetalle,
        createMutation,
        updateMutation,
        deleteMutation,
        inscribirMutation,
        desinscribirMutation,
        updatePaymentMutation
    };
};

export default useEventos;
