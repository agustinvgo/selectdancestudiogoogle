import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SitePreloader = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Encontrar todas las imágenes en el documento una vez montado
        const images = Array.from(document.images);
        const totalImages = images.length;

        if (totalImages === 0) {
            setIsLoading(false);
            return;
        }

        let loadedCount = 0;

        const updateProgress = () => {
            loadedCount++;
            setProgress(Math.round((loadedCount / totalImages) * 100));
            if (loadedCount === totalImages) {
                // Pequeño delay para que la transición sea suave si carga muy rápido
                setTimeout(() => setIsLoading(false), 800);
            }
        };

        images.forEach((img) => {
            if (img.complete) {
                updateProgress();
            } else {
                img.addEventListener('load', updateProgress);
                img.addEventListener('error', updateProgress); // Ignorar errores para no bloquear
            }
        });

        // Fallback maximo de 5 segundos por si alguna imagen se cuelga
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => {
            clearTimeout(timeout);
            images.forEach((img) => {
                img.removeEventListener('load', updateProgress);
                img.removeEventListener('error', updateProgress);
            });
        };
    }, []);

    // Bloquear scroll mientras carga
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isLoading]);

    return (
        <>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="text-white text-center">
                            {/* Logo */}
                            <img
                                src="/apple-touch-icon.png"
                                alt="Loading"
                                className="w-24 h-24 mx-auto mb-8 animate-pulse drop-shadow-lg"
                            />

                            {/* Texto Tracking */}
                            <div className="text-xs uppercase tracking-[0.5em] text-zinc-500 font-bold mb-4">
                                PREPARANDO ESCENARIO
                            </div>

                            {/* Barra de progreso */}
                            <div className="w-64 h-1 bg-zinc-900 rounded-full mx-auto overflow-hidden">
                                <motion.div
                                    className="h-full bg-red-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2 }}
                                />
                            </div>
                            <div className="mt-2 text-[10px] text-zinc-600 font-mono">
                                {progress}%
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contenido Real de la Página */}
            <div className={isLoading ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100 transition-opacity duration-1000'}>
                {children}
            </div>
        </>
    );
};

export default SitePreloader;
