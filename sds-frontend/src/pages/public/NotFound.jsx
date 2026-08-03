import { Link, useLocation } from 'react-router-dom';
import PageSEO from '../../components/SEO/PageSEO.jsx';

const NotFound = () => {
    const location = useLocation();

    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
            <PageSEO
                title="Página no encontrada"
                description="La página solicitada no existe en Select Dance Studio."
                canonical={location.pathname}
                noIndex
            />
            <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">Error 404</p>
                <h1 className="mt-5 text-5xl font-black uppercase tracking-tight sm:text-7xl">Página no encontrada</h1>
                <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
                    La dirección que ingresaste no existe o fue modificada.
                </p>
                <Link
                    to="/"
                    className="mt-9 inline-block bg-white px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200"
                >
                    Volver al inicio
                </Link>
            </div>
        </main>
    );
};

export default NotFound;

