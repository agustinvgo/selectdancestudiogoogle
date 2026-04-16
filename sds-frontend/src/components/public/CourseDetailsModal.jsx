import React from 'react';
import Modal from '../Modal';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const CourseDetailsModal = ({ isOpen, onClose, course, onRequestTrial }) => {
    if (!course) return null;

    // Data Processing Helpers
    const parseLevels = (data) => {
        if (!data) return [];
        try {
            if (typeof data === 'string') {
                if (data.trim().startsWith('[')) {
                    const parsed = JSON.parse(data);
                    return parseLevels(parsed);
                }
                return [data];
            }
            if (Array.isArray(data)) {
                return data.flatMap(item => parseLevels(item)).filter(Boolean);
            }
            return [String(data)];
        } catch {
            return [String(data)];
        }
    };

    const formatLevel = (l) => {
        const s = String(l).trim();
        if (s === '1' || s.toLowerCase().includes('principiante')) return 'Level 1';
        if (s === '2' || s.toLowerCase().includes('intermedio')) return 'Level 2';
        if (s === '3' || s.toLowerCase().includes('avanzado')) return 'Level 3';
        if (s.toLowerCase().includes('todos')) return 'All Levels';
        return s;
    };

    // Helper for badges
    const getLevelStyle = (nivel) => {
        const n = String(nivel).toLowerCase();
        // Monochrome badges
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5);
    };

    const levels = [...new Set(parseLevels(course.nivel).map(formatLevel))];
    const categories = [...new Set(parseLevels(course.categoria).map(c => String(c).trim()).filter(Boolean))];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Clase">
            <div className="space-y-6">
                {/* Header Information */}
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-900 uppercase italic tracking-tighter">
                            {course.nombre}
                        </h3>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {categories.map((cat, idx) => (
                                <span
                                    key={`cat-${idx}`}
                                    className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full bg-gray-100 text-gray-700 border-gray-200"
                                >
                                    {cat}
                                </span>
                            ))}
                            {levels.map((lvl, idx) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full ${getLevelStyle(lvl)}`}
                                >
                                    {lvl}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {course.descripcion || "Descripción no disponible para esta clase."}
                    </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-3 text-black" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Día y Horario</span>
                            <span className="font-semibold text-gray-900">{course.horario_dia} {formatTime(course.horario_hora)}</span>
                        </div>
                    </div>

                    <div className="flex items-center text-gray-600">
                        <ClockIcon className="w-5 h-5 mr-3 text-black" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Duración</span>
                            <span className="font-semibold text-gray-900">{course.duracion_minutos} min</span>
                        </div>
                    </div>

                    <div className="flex items-center text-gray-600 col-span-2">
                        <UserIcon className="w-5 h-5 mr-3 text-black" />
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Instructor</span>
                            <span className="font-semibold text-gray-900">
                                {course.nombre_profesor ? `${course.nombre_profesor} ${course.apellido_profesor || ''}`.trim() : (course.profesor || 'STAFF')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex flex-col md:flex-row gap-3 justify-end border-t border-gray-200 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
                    >
                        Cerrar
                    </button>
                    <button
                        onClick={() => onRequestTrial(course)}
                        className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        Solicitar Clase de Prueba
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CourseDetailsModal;
