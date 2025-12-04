const Loader = ({ fullScreen = true }) => {
    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sds-red"></div>
                    <p className="mt-4 text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sds-red"></div>
        </div>
    );
};

export default Loader;
