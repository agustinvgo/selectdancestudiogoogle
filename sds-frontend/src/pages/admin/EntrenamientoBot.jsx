
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
    CpuChipIcon,
    BookOpenIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const EntrenamientoBot = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'knowledge' | 'connection'
    const toast = useToast();

    // Prompt State
    const [systemPrompt, setSystemPrompt] = useState('');
    const [savingPrompt, setSavingPrompt] = useState(false);

    // Knowledge State
    const [knowledgeList, setKnowledgeList] = useState([]);
    const [editingTopic, setEditingTopic] = useState(null); // id or null
    const [topicForm, setTopicForm] = useState({ tema: '', contenido: '' });
    const [savingTopic, setSavingTopic] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // El estado de conexión fue migrado a la página de mensajería

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promptRes, knowledgeRes] = await Promise.all([
                api.get('/admin/bot/prompt'),
                api.get('/admin/bot/knowledge')
            ]);
            setSystemPrompt(promptRes.data.data || '');
            setKnowledgeList(knowledgeRes.data.data || []);
        } catch (error) {
            console.error('Error fetching bot data:', error);
            toast.error('Error cargando datos del bot');
        } finally {
            setLoading(false);
        }
    };

    // --- Prompt Handlers ---
    const handleSavePrompt = async () => {
        setSavingPrompt(true);
        try {
            await api.put('/admin/bot/prompt', { prompt: systemPrompt });
            toast.success('Personalidad actualizada correctamente');
        } catch (error) {
            console.error('Error updating prompt:', error);
            toast.error('Error al guardar personalidad');
        } finally {
            setSavingPrompt(false);
        }
    };

    // --- Knowledge Handlers ---
    const handleOpenModal = (topic = null) => {
        if (topic) {
            setEditingTopic(topic.id);
            setTopicForm({ tema: topic.tema, contenido: topic.contenido });
        } else {
            setEditingTopic(null);
            setTopicForm({ tema: '', contenido: '' });
        }
        setShowModal(true);
    };

    const handleSaveTopic = async (e) => {
        e.preventDefault();
        setSavingTopic(true);
        try {
            if (editingTopic) {
                await api.put(`/admin/bot/knowledge/${editingTopic}`, topicForm);
                toast.success('Tema actualizado');
            } else {
                await api.post('/admin/bot/knowledge', topicForm);
                toast.success('Nuevo tema creado');
            }
            setShowModal(false);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error saving topic:', error);
            toast.error('Error al guardar tema');
        } finally {
            setSavingTopic(false);
        }
    };

    const handleDeleteTopic = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este tema?')) return;
        try {
            await api.delete(`/admin/bot/knowledge/${id}`);
            toast.success('Tema eliminado');
            setKnowledgeList(prev => prev.filter(k => k.id !== id));
        } catch (error) {
            console.error('Error deleting topic:', error);
            toast.error('Error al eliminar tema');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <CpuChipIcon className="h-8 w-8 text-indigo-600" />
                        Entrenamiento IA
                    </h1>
                    <p className="text-gray-500 mt-1">Configura la personalidad y el conocimiento del asistente virtual.</p>
                </div>
                <div>
                    <Link to="/admin/mensajeria" className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors border border-indigo-200">
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        Ir a Conexión y Mensajería
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`${activeTab === 'prompt'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <CpuChipIcon className="h-5 w-5 mr-2" />
                        Personalidad y Reglas
                    </button>
                    <button
                        onClick={() => setActiveTab('knowledge')}
                        className={`${activeTab === 'knowledge'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <BookOpenIcon className="h-5 w-5 mr-2" />
                        Base de Conocimiento
                    </button>
                    {/* Pestaña de Conexión de WhatsApp eliminada y centralizada en Mensajería */}
                </nav>
            </div>

            {activeTab === 'prompt' ? (
                <div className="card max-w-4xl">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Instrucciones del Sistema</h2>
                        <button onClick={fetchData} className="btn btn-ghost btn-sm" title="Recargar">
                            <ArrowPathIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Estas son las instrucciones "sagradas" que el bot seguirá. Define aquí su tono, qué puede hacer y qué no.
                                        <br /><strong>Nota:</strong> Los horarios y datos del alumno se inyectan automáticamente, no hace falta ponerlos aquí.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full h-[500px] font-mono p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 resize-none"
                            placeholder="Eres un asistente útil..."
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSavePrompt}
                                disabled={savingPrompt}
                                className="btn btn-primary"
                            >
                                {savingPrompt ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Temas de Conocimiento</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-primary btn-sm flex items-center"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Nuevo Tema
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {knowledgeList.map(topic => (
                                <div key={topic.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-indigo-600">{topic.tema}</h3>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(topic)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTopic(topic.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4">
                                        {topic.contenido}
                                    </p>
                                </div>
                            ))}
                            {knowledgeList.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <BookOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                    <p>No hay temas de conocimiento creados aún.</p>
                                    <button onClick={() => handleOpenModal()} className="text-indigo-600 hover:underline mt-2">
                                        Crear el primero
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-scale-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingTopic ? 'Editar Tema' : 'Nuevo Tema de Conocimiento'}
                        </h3>
                        <form onSubmit={handleSaveTopic}>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Título del Tema</label>
                                    <input
                                        type="text"
                                        value={topicForm.tema}
                                        onChange={e => setTopicForm({ ...topicForm, tema: e.target.value })}
                                        className="input w-full"
                                        placeholder="Ej: Vestimenta, Ubicación, Precios..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="label">Contenido / Respuesta</label>
                                    <textarea
                                        value={topicForm.contenido}
                                        onChange={e => setTopicForm({ ...topicForm, contenido: e.target.value })}
                                        className="input w-full h-32"
                                        placeholder="La información que el bot debe saber sobre este tema..."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingTopic}
                                    className="btn btn-primary"
                                >
                                    {savingTopic ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntrenamientoBot;
