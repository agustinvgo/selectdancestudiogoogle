import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { clasePruebaAPI, esperaAPI } from '../../services/api';
import Modal from '../../components/Modal';

const TrialModal = ({ isOpen, onClose, selectedCourse, courses }) => {
    const [submitting, setSubmitting] = useState(false);
    const [manualSlots, setManualSlots] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    const initialFormData = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        interes: selectedCourse || '',
        horario: ''
    };

    const [formData, setFormData] = useState(initialFormData);

    // Update interest when prop changes
    useEffect(() => {
        if (selectedCourse) {
            setFormData(prev => ({ ...prev, interes: selectedCourse }));
        }
    }, [selectedCourse]);

    // Fetch slots when modal opens
    useEffect(() => {
        if (isOpen) {
            const fetchSlots = async () => {
                try {
                    const response = await clasePruebaAPI.getDisponibles();
                    setManualSlots(Array.isArray(response.data.data) ? response.data.data : []);
                } catch (error) {
                    console.error('Error fetching slots:', error);
                    setManualSlots([]);
                }
            };
            fetchSlots();
        }
    }, [isOpen]);

    // Calculate available dates based on interest
    useEffect(() => {
        if (!formData.interes) {
            setAvailableDates([]);
            setFormData(prev => ({ ...prev, horario: '' }));
            return;
        }

        if (!Array.isArray(manualSlots)) {
            setAvailableDates([]);
            return;
        }

        try {
            const cursoSlots = manualSlots.filter(s => s && s.curso_nombre === formData.interes);

            if (cursoSlots.length > 0) {
                const dates = cursoSlots.map(s => {
                    if (!s || !s.fecha || !s.horario) return null;
                    const dateDesc = `${s.fecha.substring(0, 10)} - ${s.horario}`;
                    let displayStr = dateDesc;
                    let isWaitlist = false;

                    if (s.cupos <= 0) {
                        displayStr += ' (Lista de Espera)';
                        isWaitlist = true;
                    } else if (s.cupos < 5) {
                        displayStr += ` (¡Solo quedan ${s.cupos} lugares!)`;
                    } else {
                        displayStr += ` (${s.cupos} vacantes)`;
                    }

                    return {
                        value: dateDesc,
                        display: displayStr,
                        isWaitlist: isWaitlist,
                        id: s.id,
                        descripcion: s.descripcion // Pass description
                    };
                }).filter(Boolean);

                setAvailableDates(dates);
                setFormData(prev => ({ ...prev, horario: '' }));
            } else {
                setAvailableDates([]);
                setFormData(prev => ({ ...prev, horario: '' }));
            }
        } catch (err) {
            console.error('Error processing slots:', err);
            setAvailableDates([]);
        }
    }, [formData.interes, manualSlots]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const selectedSlot = availableDates.find(d => d.value === formData.horario);
            const isWaitlist = selectedSlot?.isWaitlist;

            if (isWaitlist) {
                await esperaAPI.join(formData);
                toast.success('¡Te has unido a la lista de espera! Te avisaremos si se libera un lugar.');
            } else {
                const response = await clasePruebaAPI.requestTrial(formData);
                toast.success('¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo.');
            }

            onClose();
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            toast.error(error.response?.data?.message || 'Hubo un error al enviar la solicitud.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Clase de Prueba">
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Completa tus datos y nos pondremos en contacto contigo para coordinar tu primera experiencia en Select Dance Studio.
                </p>
                
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
                    <p className="text-red-800 text-sm">
                        <span className="font-bold">Valor de la clase: $30.000</span>. Este monto será descontado del valor de la matrícula en caso de inscribirte formalmente.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Tu nombre"
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Apellido</label>
                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                            placeholder="Tu apellido"
                            className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={submitting}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="ejemplo@email.com"
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitting}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">
                        Teléfono (WhatsApp) <span className="text-gray-500 text-[9px] ml-1 normal-case font-normal">* Incluye código de país</span>
                    </label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[+\d\s-]*$/.test(val)) handleChange(e);
                        }}
                        placeholder="+54 9 11 1234 5678"
                        pattern="^\+[\d\s-]{8,}$"
                        title="Por favor ingresa un número válido con código de país (ej: +54...)"
                        required
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={submitting}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Curso de Interés</label>
                    <div className="relative">
                        <select
                            name="interes"
                            value={formData.interes}
                            onChange={handleChange}
                            disabled={submitting}
                            className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm appearance-none ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="">Selecciona un estilo (Opcional)</option>
                            {[...new Set(courses.map(c => c.nombre))].sort().map(nombre => (
                                <option key={nombre} value={nombre} className="text-gray-900 bg-white">{nombre}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    {availableDates.length > 0 && (
                        <div className="animate-fade-in-up mt-5">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">
                                Elige tu fecha y horario
                            </label>
                            <div className="relative">
                                <select
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    required
                                    disabled={submitting}
                                    className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm appearance-none ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">Selecciona una fecha</option>
                                    {availableDates.map((slot, idx) => (
                                        <option key={idx} value={slot.value} className="text-gray-900 bg-white">
                                            {slot.display}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                            {/* Mostrar descripción si existe para la fecha seleccionada */}
                            {(() => {
                                const selectedSlot = availableDates.find(d => d.value === formData.horario);
                                if (selectedSlot && selectedSlot.descripcion) {
                                    return (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-600 italic">
                                                <span className="font-bold not-italic">Nota:</span> {selectedSlot.descripcion}
                                            </p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                    )}
                </div>

                <div className="pt-6 flex justify-end border-t border-gray-200 mt-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Procesando...' :
                            availableDates.find(d => d.value === formData.horario)?.isWaitlist ? 'Unirme a Lista de Espera' : 'ENVIAR SOLICITUD'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TrialModal;

