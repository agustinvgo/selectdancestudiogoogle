import Modal from '../../Modal';
import Button from '../../Button';
import { useFormValidation, validationRules } from '../../../hooks/useFormValidation';
import { useEffect } from 'react';

const PaymentModal = ({
    isOpen,
    onClose,
    formData,
    setFormData,
    handleSubmit,
    tipoPagoActivo,
    setTipoPagoActivo,
    alumnos,
    cursos,
    registrando
}) => {
    // Define validation rules
    const validations = {
        alumno_id: [validationRules.required('Alumno')],
        monto: [
            validationRules.required('Monto'),
            validationRules.positiveNumber('Monto')
        ],
        fecha_vencimiento: [validationRules.required('Fecha de vencimiento')]
    };

    const {
        values,
        errors,
        touched,
        handleChange: baseHandleChange,
        handleBlur,
        validateAll,
        setValues
    } = useFormValidation(formData, validations);

    const handleChange = (field, value) => {
        baseHandleChange(field, value);
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Sync con el formData del padre cuando cambia externamente (ej: reset al abrir)
    useEffect(() => {
        setValues(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Solo re-sincronizar cuando el modal se abre/cierra, no en cada keystroke


    const onSubmitWithValidation = (e) => {
        e.preventDefault();
        if (validateAll()) {
            handleSubmit(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago">
            {/* Tabs para seleccionar tipo de pago */}
            <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg mb-6 border border-gray-200">
                <button
                    type="button"
                    onClick={() => {
                        setTipoPagoActivo('matricula');
                        handleChange('concepto', 'Matrícula');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPagoActivo === 'matricula'
                        ? 'bg-white text-black shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                        }`}
                >
                    💳 Matrícula
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setTipoPagoActivo('mensualidad');
                        handleChange('concepto', 'Mensualidad');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPagoActivo === 'mensualidad'
                        ? 'bg-white text-black shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                        }`}
                >
                    📅 Mensualidad
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setTipoPagoActivo('evento');
                        handleChange('concepto', 'Evento');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPagoActivo === 'evento'
                        ? 'bg-white text-black shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                        }`}
                >
                    🎉 Evento
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setTipoPagoActivo('uniforme');
                        handleChange('concepto', 'Uniforme');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPagoActivo === 'uniforme'
                        ? 'bg-white text-black shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                        }`}
                >
                    👕 Uniforme
                </button>
                <button
                    type="button"
                    disabled={registrando}
                    onClick={() => {
                        setTipoPagoActivo('otro');
                        handleChange('concepto', 'Otro');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPagoActivo === 'otro'
                        ? 'bg-white text-black shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-black hover:bg-gray-200'
                        } ${registrando ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    📝 Otro
                </button>
            </div>

            <form onSubmit={onSubmitWithValidation} className="space-y-4">
                {/* Campo común: Alumno */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alumno *</label>
                    <select
                        value={values.alumno_id}
                        onChange={(e) => handleChange('alumno_id', e.target.value)}
                        onBlur={() => handleBlur('alumno_id')}
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-colors ${touched.alumno_id && errors.alumno_id
                            ? 'border-red-300 bg-red-50 text-red-900'
                            : 'border-gray-300'
                            } ${registrando ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={registrando}
                        required
                    >
                        <option value="">Seleccionar alumno...</option>
                        {alumnos.map((alumno) => (
                            <option key={alumno.id} value={alumno.id}>
                                {alumno.nombre} {alumno.apellido}
                            </option>
                        ))}
                    </select>
                    {touched.alumno_id && errors.alumno_id && (
                        <p className="mt-1 text-sm text-red-400">{errors.alumno_id}</p>
                    )}
                </div>

                {/* Contenido según el tipo de pago */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div className="flex items-start space-x-2 text-gray-500 text-sm">
                        <span>💡</span>
                        <p>
                            {tipoPagoActivo === 'matricula' && 'La matrícula es un pago único al inscribirse.'}
                            {tipoPagoActivo === 'mensualidad' && 'La mensualidad corresponde al pago de clases.'}
                            {tipoPagoActivo === 'evento' && 'Pago para participar en un evento específico.'}
                            {tipoPagoActivo === 'uniforme' && 'Adquisición de vestimenta oficial de la academia.'}
                            {tipoPagoActivo === 'otro' && 'Concepto de pago general.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monto ({values.concepto || 'Pago'}) *</label>
                            <input
                                type="number"
                                value={values.monto}
                                onChange={(e) => handleChange('monto', e.target.value)}
                                onBlur={() => handleBlur('monto')}
                                className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black transition-colors outline-none ${touched.monto && errors.monto
                                    ? 'border-red-300 bg-red-50 text-red-900'
                                    : 'border-gray-300'
                                    } ${registrando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={registrando}
                                required
                                min="0"
                                step="0.01"
                                placeholder="Ej: 5000"
                            />
                            {touched.monto && errors.monto && (
                                <p className="mt-1 text-sm text-red-400">{errors.monto}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
                            <input
                                type="date"
                                value={values.fecha_vencimiento}
                                onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                                onBlur={() => handleBlur('fecha_vencimiento')}
                                className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black transition-colors outline-none ${touched.fecha_vencimiento && errors.fecha_vencimiento
                                    ? 'border-red-300 bg-red-50 text-red-900'
                                    : 'border-gray-300'
                                    }`}
                                required
                            />
                            {touched.fecha_vencimiento && errors.fecha_vencimiento && (
                                <p className="mt-1 text-sm text-red-400">{errors.fecha_vencimiento}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Curso (Opcional)</label>
                        <select
                            value={values.curso_id}
                            onChange={(e) => handleChange('curso_id', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                            <option value="">Sin curso específico</option>
                            {cursos.map((curso) => (
                                <option key={curso.id} value={curso.id}>
                                    {curso.nombre} - {curso.dia_semana} {curso.hora_inicio}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" disabled={registrando}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={registrando}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors flex items-center"
                    >
                        {registrando ? 'Registrando...' : `Registrar ${values.concepto}`}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentModal;

