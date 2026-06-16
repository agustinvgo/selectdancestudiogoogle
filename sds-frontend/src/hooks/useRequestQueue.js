import { useRef, useCallback, useState } from 'react';

/**
 * useRequestQueue
 * Cola que ejecuta las requests al backend de a una por vez.
 * Si llegan varias al mismo tiempo, las encola y ejecuta secuencialmente.
 * Evita que el backend se caiga por requests simultaneas.
 */
const useRequestQueue = () => {
    const queue = useRef([]);
    const isProcessing = useRef(false);
    const [pendingCount, setPendingCount] = useState(0);

    const processNext = useCallback(async () => {
        if (isProcessing.current || queue.current.length === 0) return;

        isProcessing.current = true;
        const { fn, resolve, reject } = queue.current.shift();
        setPendingCount(queue.current.length);

        try {
            const result = await fn();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            isProcessing.current = false;
            if (queue.current.length > 0) {
                // Pequena pausa entre requests para no saturar el backend
                setTimeout(processNext, 150);
            } else {
                setPendingCount(0);
            }
        }
    }, []);

    /**
     * enqueue(fn) — Agrega una funcion async a la cola y la ejecuta cuando le toca.
     * Retorna una Promise que resuelve cuando la request termina.
     * Uso: await enqueue(() => cursosAPI.update(id, data))
     */
    const enqueue = useCallback((fn) => {
        return new Promise((resolve, reject) => {
            queue.current.push({ fn, resolve, reject });
            setPendingCount(queue.current.length);
            processNext();
        });
    }, [processNext]);

    return { enqueue, pendingCount };
};

export default useRequestQueue;