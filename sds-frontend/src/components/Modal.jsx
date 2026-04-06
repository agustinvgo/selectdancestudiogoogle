import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    // Modal size classes with mobile full-width support
    const sizeClasses = {
        sm: 'max-w-md w-full',
        md: 'max-w-xl w-full',
        lg: 'max-w-3xl w-full',
        xl: 'max-w-5xl w-full',
        full: 'max-w-full w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className={`
                        relative transform overflow-hidden bg-white text-left shadow-xl transition-all 
                        ${sizeClasses[size]} 
                        rounded-2xl border border-gray-200
                        animate-fade-in-up flex flex-col max-h-[90vh]
                    `}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-900 tracking-wide">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar text-left">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
