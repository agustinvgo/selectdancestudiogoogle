import { useState } from 'react';
import toast from 'react-hot-toast';
import { consultasAPI } from '../../services/api';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await consultasAPI.create(formData);
            toast.success('¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.', {
                duration: 5000,
                position: 'bottom-center'
            });
            setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
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
                            <a href="https://maps.google.com/?q=Select+Dance+Studio+Honduras+5550" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-red-500 transition-colors group">
                                <span className="w-12 h-[1px] bg-red-600 group-hover:w-16 transition-all duration-300"></span>
                                HONDURAS 5550, OF. 105
                            </a>
                            <a href="https://maps.google.com/?q=Palermo+Buenos+Aires" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-red-500 transition-colors group">
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
                                disabled={loading}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-5 rounded-none hover:bg-gray-800 dark:hover:bg-gray-200 transition-all uppercase tracking-[0.2em] text-xs mt-8"
                            >
                                {loading ? 'ENVIANDO...' : 'ENVIAR CONSULTA'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="mt-20 w-full h-[400px] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.665796792673!2d-58.43572842426038!3d-34.58731997296016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb58eb7d6b387%3A0x6b8c0a877133989!2sHonduras%205550%2C%20C1414%20CABA!5e0!3m2!1ses!2sar!4v1709400000000!5m2!1ses!2sar"
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

