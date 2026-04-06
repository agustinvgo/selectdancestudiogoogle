
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useToast from '../../hooks/useToast';
import Loader from '../../components/Loader';
import {
    CpuChipIcon,
    BookOpenIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    ArrowPathIcon,
    QrCodeIcon
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

    // Connection State
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [qrCode, setQrCode] = useState(null);

    useEffect(() => {
        if (activeTab === 'connection') {
            const interval = setInterval(fetchStatus, 3000); // Poll every 3s
            fetchStatus(); // Initial fetch
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/admin/bot/status');
            setConnectionStatus(res.data.data.status);
            setQrCode(res.data.data.qr);
        } catch (error) {
            console.error('Error fetching bot status:', error);
        }
    };

    const handleLogout = async () => {
        if (!window.confirm('¿Seguro que quieres desconectar el bot?')) return;
        try {
            await api.post('/admin/bot/logout');
            toast.success('Desconectado. Generando nuevo QR...');
            setConnectionStatus('disconnected');
            setQrCode(null);
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error('Error al desconectar');
        }
    };

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <CpuChipIcon className="h-8 w-8 text-indigo-600" />
                        Entrenamiento IA
                    </h1>
                    <p className="text-gray-500 mt-1">Configura la personalidad y el conocimiento del asistente virtual.</p>
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
                    <button
                        onClick={() => setActiveTab('connection')}
                        className={`${activeTab === 'connection'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <QrCodeIcon className="h-5 w-5 mr-2" />
                        Conexión WhatsApp
                    </button>
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
            ) : activeTab === 'knowledge' ? (
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
            ) : (
                <div className="card max-w-2xl mx-auto">
                    <div className="card-header">
                        <h2 className="text-lg font-bold text-gray-900">Estado de Conexión</h2>
                    </div>
                    <div className="card-body text-center py-8">
                        {connectionStatus === 'connected' ? (
                            <div className="space-y-4 animate-scale-in">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CpuChipIcon className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-green-700">¡Bot Conectado!</h3>
                                <p className="text-gray-600">El bot está activo y respondiendo mensajes.</p>
                                <button onClick={handleLogout} className="btn btn-outline-danger mt-4">
                                    Cerrar Sesión / Desconectar
                                </button>
                            </div>
                        ) : connectionStatus === 'qr_ready' && qrCode ? (
                            <div className="space-y-4 animate-scale-in">
                                <p className="text-gray-600 mb-4">Escanea este código con tu WhatsApp (Dispositivos Vinculados) para conectar el bot.</p>
                                <div className="bg-white p-4 inline-block rounded-lg shadow-lg border">
                                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                                </div>
                                <div className="flex justify-center mt-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                                <p className="text-sm text-gray-400">Esperando escaneo...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="text-gray-600">Iniciando cliente de WhatsApp...</p>
                                <p className="text-xs text-gray-400">Esto puede tardar unos segundos.</p>
                            </div>
                        )}
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
