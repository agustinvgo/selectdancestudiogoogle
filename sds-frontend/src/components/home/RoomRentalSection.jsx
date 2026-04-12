import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQS = [
    {
        q: '¿Puedo tomar una clase de prueba antes de inscribirme?',
        a: 'Sí. Ofrecemos clases de prueba con un costo que se descuenta de la matrícula al momento de inscribirte. Podés conocer el ambiente, las profes y el nivel antes de comprometerte. Consultanos disponibilidad por WhatsApp o desde el formulario de contacto.',
    },
    {
        q: '¿Desde qué edad pueden empezar?',
        a: 'Aceptamos alumnas desde los 3 años con nuestro programa Baby Dance. A medida que crecen avanzan por los niveles Mini, Junior, Teen, Senior y Recreativo, siempre adaptados a su etapa de desarrollo.',
    },
    {
        q: '¿Cómo funcionan los pagos de la cuota?',
        a: 'Al inscribirte se abona una matrícula única de ingreso. Las cuotas mensuales se pagan mes a mes, ya sea en el estudio o por transferencia bancaria. Para conocer el valor actualizado según el nivel o cantidad de clases, consultanos directamente.',
    },
    {
        q: '¿Cómo se accede al equipo de competición?',
        a: 'El equipo de competición es selectivo. Las alumnas son evaluadas por sus docentes según nivel técnico, compromiso y proyección artística. Si te interesa saber más, visitá la sección Competition de nuestra web.',
    },
    {
        q: '¿Se puede alquilar una sala para clases o ensayos?',
        a: 'Sí. Contamos con salas disponibles para clases privadas, ensayos, workshops y shootings. Para consultar disponibilidad horaria escribinos por WhatsApp o al correo del estudio.',
    },
    {
        q: '¿Dónde están ubicados?',
        a: 'Estamos en Honduras 5550, Of. 105, Palermo Hollywood, Ciudad Autónoma de Buenos Aires. Con fácil acceso en transporte público desde toda la ciudad.',
    },
];

const FAQItem = ({ q, a, isOpen, onToggle }) => (
    <div className="border-b border-white/10 last:border-0">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between gap-4 py-5 text-left group"
            aria-expanded={isOpen}
        >
            <span className="text-sm md:text-base font-semibold text-white group-hover:text-red-400 transition-colors duration-200 leading-snug">
                {q}
            </span>
            <ChevronDownIcon
                className={`w-5 h-5 shrink-0 text-red-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <p className="pb-5 text-zinc-400 text-sm leading-relaxed pr-8">{a}</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const RoomRentalSection = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    const whatsappMsg = encodeURIComponent('Hola! Me interesa consultar sobre el alquiler de salas en Select Dance Studio.');
    const whatsappUrl = `https://wa.me/message/ZNBV2CLWYU36H1?text=${whatsappMsg}`;

    return (
        <section className="py-24 bg-black relative overflow-hidden" id="alquiler-salas">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-800/8 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* ── Columna izquierda: info + CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">
                            Espacios Disponibles
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-6">
                            Alquilá<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
                                Nuestra Sala
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-base leading-relaxed max-w-md mb-10">
                            Contamos con salas profesionales equipadas para clases, ensayos,
                            shootings y workshops. Un espacio de alto rendimiento disponible
                            para que des rienda suelta a tu proyecto artístico.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <a
                                id="sala-whatsapp-cta"
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm uppercase tracking-widest shadow-lg shadow-red-900/30 hover:shadow-red-900/50"
                            >
                                {/* WhatsApp icon */}
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.847L.057 23.97l6.266-1.644A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.032-1.386l-.36-.214-3.724.977.995-3.634-.235-.374A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                                </svg>
                                Consultar por WhatsApp
                            </a>
                            <a
                                id="sala-email-cta"
                                href="mailto:selectdancestudio.ar@gmail.com?subject=Consulta%20Alquiler%20de%20Sala"
                                className="inline-flex items-center justify-center gap-2 bg-transparent border border-zinc-700 hover:border-red-500/60 text-white font-bold px-8 py-4 rounded-full transition-all duration-200 text-sm uppercase tracking-widest"
                            >
                                Enviar email
                            </a>
                        </div>

                        {/* Video de la sala */}
                        <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl group">
                            <video
                                src="/sala.mp4"
                                poster="/sala-danza.png"
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* Overlay degradado */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                            {/* Badge */}
                            <div className="absolute bottom-4 left-4">
                                <span className="inline-block bg-black/60 backdrop-blur-sm border border-white/10 text-white text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                                    Palermo Hollywood · CABA
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Columna derecha: FAQ ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
                    >
                        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-1">Preguntas Frecuentes</p>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">
                            Todo lo que necesitás saber
                        </h3>

                        <div>
                            {FAQS.map((item, i) => (
                                <FAQItem
                                    key={i}
                                    q={item.q}
                                    a={item.a}
                                    isOpen={openIndex === i}
                                    onToggle={() => toggle(i)}
                                />
                            ))}
                        </div>

                        {/* Nota al pie */}
                        <div className="mt-8 border-t border-zinc-800 pt-6">
                            <p className="text-zinc-500 text-xs leading-relaxed">
                                ¿Tenés alguna duda que no aparece acá? 
                                Escribinos directamente y te respondemos a la brevedad.
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default RoomRentalSection;
