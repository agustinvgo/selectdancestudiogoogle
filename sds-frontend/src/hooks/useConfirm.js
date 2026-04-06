import { useState, useCallback } from 'react';

/**
 * useConfirm - Hook personalizado para manejar diálogos de confirmación
 * 
 * @returns {Object} - Contiene isOpen, confirmConfig, confirm() y closeConfirm()
 * 
 * @example
 * const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();
 * 
 * const handleDelete = () => {
 *   confirm({
 *     title: '¿Eliminar alumno?',
 *     message: '¿Estás seguro de eliminar a Juan Pérez?',
 *     onConfirm: async () => {
 *       await deleteAlumno(id);
 *     },
 *     variant: 'danger',
 *     confirmText: 'Eliminar'
 *   });
 * };
 */
const useConfirm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '¿Estás seguro?',
        message: '',
        onConfirm: () => { },
        variant: 'warning',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });

    const confirm = useCallback(({
        title = '¿Estás seguro?',
        message,
        onConfirm,
        variant = 'warning',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    }) => {
        setConfirmConfig({
            title,
            message,
            onConfirm,
            variant,
            confirmText,
            cancelText
        });
        setIsOpen(true);
    }, []);

    const closeConfirm = useCallback(() => {
        setIsOpen(false);
    }, []);

    return {
        isOpen,
        confirmConfig,
        confirm,
        closeConfirm
    };
};

export default useConfirm;
