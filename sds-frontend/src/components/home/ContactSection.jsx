import { useState } from 'react';
import { SITE } from '../../config/site.js';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../../utils/whatsapp.js';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = [
            'Hola, vi la web de Select Dance Studio y quisiera hacer una consulta.',
            `Nombre: ${formData.nombre}`,
            `Email: ${formData.email}`,
            formData.telefono ? `Teléfono: ${formData.telefono}` : null,
            `Consulta: ${formData.mensaje}`,
        ].filter(Boolean).join('\n');

        trackWhatsAppClick({ source: '/contacto', service: 'formulario_contacto' });
        window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="relative py-24 px-4 md:px-8 bg-transparent text-inherit transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="block text-xs font-bold text-red-600 tracking-[0.2em] mb-4 uppercase">Contacto</span>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 uppercase leading-none">
                            Únete al<br />Estudio
                        </h2>
                        <p className="text-inherit opacity-60 text-lg mb-12 max-w-md font-light transition-colors duration-500">
                            Estamos ubicados en el corazón de Palermo Hollywood. Ven a conocer nuestro estudio.
                        </p>

                        <div className="space-y-6 text-sm font-bold tracking-widest">
                            <a href={SITE.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-red-500 transition-colors group">
                                <span className="w-12 h-[1px] bg-red-600 group-hover:w-16 transition-all duration-300"></span>
                                HONDURAS 5550, OF. 105
                            </a>
                            <a href={SITE.maps} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-red-500 transition-colors group">
                                <span className="w-12 h-[1px] bg-red-600 group-hover:w-16 transition-all duration-300"></span>
                                PALERMO, BUENOS AIRES
                            </a>
                            <a href="mailto:selectdancestudio.ar@gmail.com" className="flex items-center gap-4 hover:text-red-500 transition-colors group">
                                <span className="w-12 h-[1px] bg-red-600 group-hover:w-16 transition-all duration-300"></span>
                                SELECTDANCESTUDIO.AR@GMAIL.COM
                            </a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-white/20 transition-colors duration-500 shadow-xl dark:shadow-none">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="NOMBRE COMPLETO"
                                    required
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all text-sm tracking-widest uppercase"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="EMAIL"
                                    required
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all text-sm tracking-widest uppercase"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="TELÉFONO"
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all text-sm tracking-widest uppercase"
                                />
                            </div>
                            <div>
                                <textarea
                                    name="mensaje"
                                    rows="3"
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    placeholder="MENSAJE"
                                    required
                                    className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all text-sm tracking-widest uppercase resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-5 rounded-none hover:bg-gray-800 dark:hover:bg-gray-200 transition-all uppercase tracking-[0.2em] text-xs mt-8"
                            >
                                CONTINUAR EN WHATSAPP
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-20 w-full h-[400px] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                    src="https://www.google.com/maps?q=Honduras+5550,+Oficina+105,+C1414BND,+Buenos+Aires&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>
    );
};

export default ContactSection;

