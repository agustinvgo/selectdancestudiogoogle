import { useState } from 'react';
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

const SuccessModal = ({ isOpen, onClose, title, message, copyText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copyText) {
            navigator.clipboard.writeText(copyText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || 'Éxito'}>
            <div className="text-center p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>

                {copyText && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex items-center justify-between group relative overflow-hidden">
                        <code className="text-gray-900 font-mono text-lg">{copyText}</code>
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-black"
                            title="Copiar al portapapeles"
                        >
                            {copied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full bg-black text-white font-bold py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Entendido
                </button>
            </div>
        </Modal>
    );
};

export default SuccessModal;

