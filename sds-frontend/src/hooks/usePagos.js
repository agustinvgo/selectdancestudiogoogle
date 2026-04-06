import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagosAPI, alumnosAPI, cursosAPI } from '../services/api';
import useToast from './useToast';
import useConfirm from './useConfirm';

const usePagos = ({ page, pageSize, filtroEstado, filtroMes, filtroAnio, filtroAlumno }) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    const [registrando, setRegistrando] = useState(false);
    const [generando, setGenerando] = useState(false);

    // 1. Fetch Data
    const { data: pagosData, isLoading: loadingPagos } = useQuery({
        queryKey: ['pagos', { page, pageSize, filtroEstado, filtroMes, filtroAnio, filtroAlumno }],
        queryFn: async () => {
            const params = { page, limit: pageSize, estado: filtroEstado, mes: filtroMes, anio: filtroAnio, alumno_id: filtroAlumno };
            const response = await pagosAPI.getAll(params);
            return response.data;
        },
        keepPreviousData: true,
    });

    const { data: alumnos = [] } = useQuery({
        queryKey: ['alumnos_list'],
        queryFn: async () => {
            const res = await alumnosAPI.getAll();
            return res.data.data || [];
        },
        staleTime: 10 * 60 * 1000
    });

    const { data: cursos = [] } = useQuery({
        queryKey: ['cursos_list'],
        queryFn: async () => {
            const res = await cursosAPI.getAll();
            return res.data.data || [];
        },
        staleTime: 10 * 60 * 1000
    });

    const { data: resumenFinanciero } = useQuery({
        queryKey: ['finanzas', { filtroMes, filtroAnio }],
        queryFn: async () => {
            const res = await pagosAPI.getEstadoFinanciero(filtroMes, filtroAnio);
            return res.data.data || null;
        }
    });

    // 2. Mutations
    const createPagoMutation = useMutation({
        mutationFn: (data) => pagosAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['pagos']);
            queryClient.invalidateQueries(['finanzas']);
            toast.success('Pago registrado exitosamente');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error al crear pago');
        }
    });

    const updatePagoMutation = useMutation({
        mutationFn: ({ id, data }) => pagosAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['pagos']);
            queryClient.invalidateQueries(['finanzas']);
            toast.success('Pago actualizado');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error al actualizar');
        }
    });

    // 3. Complex Handlers
    const calcularRecargoHandler = async (pagoId) => {
        try {
            const response = await pagosAPI.calcularRecargo(pagoId);
            queryClient.invalidateQueries(['pagos']);
            toast.success(response.data.message);
        } catch (error) {
            console.error('Error calculando recargo:', error);
            toast.error('Error al calcular recargo');
        }
    };

    const verComprobante = async (pagoId) => {
        try {
            const response = await pagosAPI.verArchivoComprobante(pagoId);
            const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error('Error abriendo comprobante:', error);
            toast.error('No se pudo abrir el comprobante');
        }
    };

    const rechazarComprobante = async (pagoId) => {
        confirm({
            title: 'Rechazar Comprobante',
            message: '¿Estás seguro de rechazar este comprobante? El pago volverá a estado pendiente.',
            variant: 'danger',
            onConfirm: async () => {
                updatePagoMutation.mutate({
                    id: pagoId,
                    data: { estado: 'pendiente', comprobante_url: null, notas_pago: 'Comprobante rechazado el ' + new Date().toLocaleDateString() }
                }, { onSuccess: () => toast.success('Comprobante rechazado') });
            }
        });
    };

    const handleSubirComprobante = async (pagoId, file) => {
        try {
            const formData = new FormData();
            formData.append('comprobante', file);
            await pagosAPI.subirComprobante(pagoId, formData);
            queryClient.invalidateQueries(['pagos']);
            toast.success('Comprobante subido exitosamente. El pago está en revisión.');
        } catch (error) {
            console.error('Error subiendo comprobante:', error);
            toast.error(error.response?.data?.message || 'Error al subir comprobante');
        }
    };

    const descargarComprobante = async (pagoId) => {
        try {
            const response = await pagosAPI.descargarComprobante(pagoId);
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Error al generar comprobante');
            }
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `comprobante_${String(pagoId).padStart(8, '0')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error descargando comprobante:', error);
            toast.error(`Error: ${error.message || 'No se pudo descargar el comprobante'}`);
        }
    };

    const generarPagosMensuales = async (mesAGenerar, anioAGenerar, callbackSetFiltros) => {
        const nombresMeses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        confirm({
            title: `¿Generar pagos mensuales?`,
            message: `Se generarán los pagos mensuales para ${nombresMeses[mesAGenerar]} ${anioAGenerar}.\n\nSe heredará el monto del último pago de mensualidad de cada alumno activo.`,
            variant: 'warning',
            confirmText: 'Generar',
            onConfirm: async () => {
                try {
                    setGenerando(true);
                    const response = await pagosAPI.generarPagosMensuales(mesAGenerar, anioAGenerar);
                    const { generados, omitidos } = response.data.data || {};
                    
                    queryClient.invalidateQueries(['pagos']);
                    queryClient.invalidateQueries(['finanzas']);
                    
                    if (callbackSetFiltros) callbackSetFiltros();
                    
                    if (generados === 0 && omitidos > 0) toast.warning(`Ya existen pagos para ${nombresMeses[mesAGenerar]} ${anioAGenerar}.\n\nNo se generaron pagos nuevos.`);
                    else if (generados > 0) toast.success(`${generados} pagos generados para ${nombresMeses[mesAGenerar]} ${anioAGenerar}.`);
                    else toast.info(response.data.message || 'Proceso completado');
                } catch (error) {
                    toast.error('Error al generar pagos mensuales');
                } finally {
                    setGenerando(false);
                }
            }
        });
    };

    return {
        pagosData: pagosData?.data || [],
        totalItems: pagosData?.total || 0,
        stats: pagosData?.stats || { total: 0, pendientes: 0, pagados: 0, revision: 0 },
        alumnos,
        cursos,
        resumenFinanciero,
        loadingPagos,
        createPagoMutation,
        updatePagoMutation,
        registrando,
        setRegistrando,
        generando,
        isOpen,
        confirmConfig,
        closeConfirm,
        toast,
        calcularRecargoHandler,
        verComprobante,
        rechazarComprobante,
        handleSubirComprobante,
        descargarComprobante,
        generarPagosMensuales,
        queryClient
    };
};

export default usePagos;
