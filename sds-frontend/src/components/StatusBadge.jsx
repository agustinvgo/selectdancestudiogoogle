import React from 'react';

/**
 * StatusBadge - Centralized badge component for consistent status display
 * 
 * Ensures that the same status always has the same visual appearance across the app.
 * This builds user trust through predictable, scannable interface elements.
 */

const STATUS_STYLES = {
    // Payment/General statuses
    pendiente: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        label: 'Pendiente'
    },
    pagado: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Pagado'
    },
    vencido: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Vencido'
    },
    revision: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'En Revisión'
    },

    // Attendance statuses
    presente: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Presente'
    },
    ausente: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Ausente'
    },
    tardanza: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        label: 'Tardanza'
    },

    // General statuses
    activo: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Activo'
    },
    inactivo: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        label: 'Inactivo'
    },
    confirmado: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Confirmado'
    },
    rechazado: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Rechazado'
    }
};

const StatusBadge = ({
    status,
    customLabel,
    size = 'default',
    className = ''
}) => {
    const normalizedStatus = status?.toLowerCase() || 'pendiente';
    const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pendiente;

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    return (
        <span
            className={`
                inline-flex items-center font-medium rounded-full border
                ${style.bg} ${style.text} ${style.border}
                ${sizeClasses[size]}
                ${className}
            `}
        >
            {customLabel || style.label}
        </span>
    );
};

export default StatusBadge;
