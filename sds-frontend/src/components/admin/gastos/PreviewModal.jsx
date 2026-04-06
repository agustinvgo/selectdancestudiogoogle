const PreviewModal = ({ previewUrl, previewType, setPreviewUrl }) => {
    if (!previewUrl) return null;

    const handleClose = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    };

    return (
        <div 
            className="fixed inset-0 bg-white/90 flex items-center justify-center p-4 z-[60]" 
            onClick={handleClose}
        >
            <div 
                className="relative w-full max-w-4xl h-[85vh] bg-black rounded-xl overflow-hidden flex flex-col border border-gray-800" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
                    <h3 className="text-white font-bold">Vista Previa del Comprobante</h3>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                <div className="flex-1 bg-white flex items-center justify-center overflow-hidden">
                    {previewType === 'pdf' ? (
                        <iframe src={previewUrl} className="w-full h-full" title="PDF Preview"></iframe>
                    ) : (
                        <img src={previewUrl} className="max-w-full max-h-full object-contain" alt="Comprobante" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;
