import { useCallback, useRef } from 'react';

/**
 * useDebounce
 * Retorna una version con delay de cualquier funcion.
 * Si se llama antes de que expire el delay, reinicia el timer.
 *
 * @param {Function} fn    - Funcion a ejecutar con delay
 * @param {number}   delay - Milisegundos de espera (default: 600ms)
 */
const useDebounce = (fn, delay = 600) => {
    const timer = useRef(null);

    const debouncedFn = useCallback((...args) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
            fn(...args);
            timer.current = null;
        }, delay);
    }, [fn, delay]);

    // Cancelar el timer pendiente si el componente se desmonta
    const cancel = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    return { debouncedFn, cancel };
};

export default useDebounce;