import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, TrashIcon, UserMinusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * ConfirmDialog - Modal de confirmación personalizado y atractivo
 * 
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función a ejecutar cuando se confirma
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje descriptivo
 * @param {string} confirmText - Texto del botón de confirmación (default: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelación (default: "Cancelar")
 * @param {string} variant - Variante de color: 'danger', 'warning', 'info' (default: 'warning')
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'warning'
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    // Configuración de estilos según la variante
    const variantConfig = {
        danger: {
            icon: TrashIcon,
            iconBg: 'bg-red-900/20',
            iconColor: 'text-red-500',
            buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            borderColor: 'border-red-900/50'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconBg: 'bg-yellow-900/20',
            iconColor: 'text-yellow-500',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            borderColor: 'border-yellow-900/50'
        },
        info: {
            icon: EnvelopeIcon,
            iconBg: 'bg-blue-900/20',
            iconColor: 'text-blue-500',
            buttonBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            borderColor: 'border-blue-900/50'
        },
        remove: {
            icon: UserMinusIcon,
            iconBg: 'bg-orange-900/20',
            iconColor: 'text-orange-500',
            buttonBg: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
            borderColor: 'border-orange-900/50'
        }
    };

    const config = variantConfig[variant] || variantConfig.warning;
    const Icon = config.icon;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Overlay con blur */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-white/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className={`w-full max-w-md transform overflow-hidden rounded-2xl 
                                bg-gray-50 border ${config.borderColor} shadow-2xl 
                                transition-all`}
                            >
                                <div className="p-6">
                                    {/* Icono */}
                                    <div className={`mx-auto flex h-16 w-16 items-center justify-center 
                                        rounded-full ${config.iconBg} mb-4`}>
                                        <Icon className={`h-8 w-8 ${config.iconColor}`} aria-hidden="true" />
                                    </div>

                                    {/* Título */}
                                    <Dialog.Title
                                        as="h3"
                                        className="text-xl font-bold text-gray-900 mb-3"
                                    >
                                        {title}
                                    </Dialog.Title>

                                    {/* Mensaje */}
                                    <div className="mt-2 mb-6">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {message}
                                        </p>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 
                                                bg-white border border-gray-200 rounded-lg 
                                                hover:bg-gray-100 hover:text-gray-900
                                                focus:outline-none focus:ring-2 focus:ring-gray-600 
                                                transition-colors duration-200"
                                            onClick={onClose}
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            type="button"
                                            className={`flex-1 px-4 py-2.5 text-sm font-medium text-gray-900 
                                                ${config.buttonBg} rounded-lg 
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                focus:ring-offset-gray-900
                                                transition-colors duration-200 shadow-lg`}
                                            onClick={handleConfirm}
                                        >
                                            {confirmText}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ConfirmDialog;

