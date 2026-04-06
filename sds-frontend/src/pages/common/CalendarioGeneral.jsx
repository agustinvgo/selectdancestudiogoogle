import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cursosAPI, eventosAPI } from '../../services/api';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import { CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarioGeneral = () => {
    const [events, setEvents] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [eventosData, setEventosData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filtro, setFiltro] = useState('todos'); // todos, cursos, eventos

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        generarEventosCalendario();
    }, [cursos, eventosData, filtro]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [cursosRes, eventosRes] = await Promise.all([
                cursosAPI.getAll(),
                eventosAPI.getAll()
            ]);
            setCursos(cursosRes.data.data || []);
            setEventosData(eventosRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const generarEventosCalendario = () => {
        const eventosCalendario = [];

        // Agregar cursos if filtrado
        if (filtro === 'todos' || filtro === 'cursos') {
            const hoy = moment();
            const finMes = moment().add(3, 'months'); // Mostrar 3 meses

            cursos.forEach(curso => {
                if (!curso.activo) return;

                let current = hoy.clone().startOf('week');
                while (current.isBefore(finMes)) {
                    // Encontrar el día de la semana del curso
                    const dayOfWeek = mapDayToNumber(curso.horario_dia);
                    const cursoDay = current.clone().day(dayOfWeek);

                    if (cursoDay.isAfter(hoy.clone().subtract(1, 'day'))) {
                        const [hora, minutos] = (curso.horario_hora || '18:00').split(':');
                        const start = cursoDay.clone().hour(parseInt(hora)).minute(parseInt(minutos));
                        const end = start.clone().add(curso.duracion_minutos || 60, 'minutes');

                        eventosCalendario.push({
                            id: `curso-${curso.id}-${cursoDay.format('YYYY-MM-DD')}`,
                            title: `📚 ${curso.nombre}`,
                            start: start.toDate(),
                            end: end.toDate(),
                            type: 'curso',
                            data: curso
                        });
                    }
                    current.add(1, 'week');
                }
            });
        }

        // Agregar eventos
        if (filtro === 'todos' || filtro === 'eventos') {
            eventosData.forEach(evento => {
                const fechaEvento = moment(evento.fecha);
                let start, end;

                if (evento.hora) {
                    const [hora, minutos] = evento.hora.split(':');
                    start = fechaEvento.clone().hour(parseInt(hora)).minute(parseInt(minutos));
                    end = start.clone().add(2, 'hours'); // Duración estimada
                } else {
                    start = fechaEvento.clone().hour(10).minute(0);
                    end = start.clone().add(3, 'hours');
                }

                eventosCalendario.push({
                    id: `evento-${evento.id}`,
                    title: `🎭 ${evento.nombre}`,
                    start: start.toDate(),
                    end: end.toDate(),
                    type: 'evento',
                    data: evento
                });
            });
        }

        setEvents(eventosCalendario);
    };

    const mapDayToNumber = (dia) => {
        const d = String(dia || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const dias = {
            'lunes': 1,
            'martes': 2,
            'miercoles': 3,
            'jueves': 4,
            'viernes': 5,
            'sabado': 6,
            'domingo': 0
        };
        return dias[d] !== undefined ? dias[d] : 1;
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = event.type === 'curso' ? '#3B82F6' : '#EF4444';
        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '500'
            }
        };
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
                    <p className="text-gray-500 mt-1">Vista general de clases y eventos</p>
                </div>

                {/* Filtros */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setFiltro('todos')}
                        className={`btn ${filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFiltro('cursos')}
                        className={`btn ${filtro === 'cursos' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <AcademicCapIcon className="h-5 w-5 inline mr-2" />
                        Clases
                    </button>
                    <button
                        onClick={() => setFiltro('eventos')}
                        className={`btn ${filtro === 'eventos' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
                        Eventos
                    </button>
                </div>
            </div>

            {/* Leyenda */}
            <div className="card">
                <div className="card-body py-3">
                    <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                            <span className="text-gray-600">Clases</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                            <span className="text-gray-600">Eventos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vista Calendario (Desktop) */}
            <div className="hidden md:block card">
                <div className="card-body">
                    <div style={{ height: '700px' }} className="bg-white rounded-lg p-4">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            messages={{
                                next: 'Siguiente',
                                previous: 'Anterior',
                                today: 'Hoy',
                                month: 'Mes',
                                week: 'Semana',
                                day: 'Día',
                                agenda: 'Agenda',
                                date: 'Fecha',
                                time: 'Hora',
                                event: 'Evento',
                                noEventsInRange: 'No hay eventos en este rango'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Vista Agenda (Móvil) */}
            <div className="md:hidden space-y-4">
                <div className="card bg-gradient-to-r from-blue-900/50 to-slate-900 border-blue-500/20">
                    <div className="card-body p-4">
                        <h3 className="text-gray-900 font-bold mb-1">Próximos 30 días</h3>
                        <p className="text-sm text-gray-500">Lista de clases y eventos</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {events
                        .filter(e => moment(e.start).isAfter(moment()) && moment(e.start).isBefore(moment().add(30, 'days')))
                        .sort((a, b) => a.start - b.start)
                        .slice(0, 50) // Limitar cantidad para evitar scroll infinito
                        .map((event, index) => (
                            <div
                                key={`${event.id}-${index}`} // Composite key to ensure uniqueness
                                onClick={() => handleSelectEvent(event)}
                                className={`card p-4 border-l-4 cursor-pointer active:scale-95 transition-transform ${event.type === 'curso' ? 'border-l-blue-500' : 'border-l-red-500'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                            {moment(event.start).format('dddd D [de] MMMM')}
                                        </p>
                                        <h4 className="text-gray-900 font-bold text-lg">{event.title}</h4>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                            <span className="bg-white px-2 py-1 rounded">
                                                {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${event.type === 'curso' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {event.type === 'curso' ? (
                                            <AcademicCapIcon className="w-5 h-5" />
                                        ) : (
                                            <CalendarDaysIcon className="w-5 h-5" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                    {events.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No hay eventos próximos
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalles */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedEvent?.type === 'curso' ? 'Detalles de la Clase' : 'Detalles del Evento'}
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {selectedEvent.data.nombre}
                            </h3>
                            <p className="text-gray-500">
                                {selectedEvent.type === 'curso' ? 'Clase Regular' : 'Evento Especial'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <p className="text-sm text-gray-500">Fecha y Hora</p>
                                <p className="text-gray-900 font-medium">
                                    {moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}
                                </p>
                            </div>

                            {selectedEvent.type === 'curso' && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-500">Nivel</p>
                                        <p className="text-gray-900">{selectedEvent.data.nivel}</p>
                                    </div>
                                    {selectedEvent.data.profesor && (
                                        <div>
                                            <p className="text-sm text-gray-500">Profesor</p>
                                            <p className="text-gray-900">{selectedEvent.data.profesor}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-500">Duración</p>
                                        <p className="text-gray-900">{selectedEvent.data.duracion_minutos} minutos</p>
                                    </div>
                                </>
                            )}

                            {selectedEvent.type === 'evento' && (
                                <>
                                    {selectedEvent.data.lugar && (
                                        <div>
                                            <p className="text-sm text-gray-500">Lugar</p>
                                            <p className="text-gray-900">{selectedEvent.data.lugar}</p>
                                        </div>
                                    )}
                                    {selectedEvent.data.descripcion && (
                                        <div>
                                            <p className="text-sm text-gray-500">Descripción</p>
                                            <p className="text-gray-900">{selectedEvent.data.descripcion}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CalendarioGeneral;

