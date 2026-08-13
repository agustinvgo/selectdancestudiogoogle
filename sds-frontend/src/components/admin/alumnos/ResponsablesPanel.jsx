import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlusIcon, TrashIcon, StarIcon, EnvelopeIcon, BellAlertIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { alumnosAPI } from '../../../services/api';
import useToast from '../../../hooks/useToast';

const initialForm = {
    mode: 'existing',
    usuario_id: '',
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    password: '',
    parentesco: 'Madre / Padre',
    es_principal: true,
    recibe_notificaciones: true,
    puede_ver_pagos: true,
    puede_confirmar_asistencia: true,
};

const ResponsablesPanel = ({ alumnoId }) => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(initialForm);
    const [expanded, setExpanded] = useState(false);

    const { data: responsables = [], isLoading } = useQuery({
        queryKey: ['alumno-responsables', alumnoId],
        queryFn: async () => (await alumnosAPI.getResponsables(alumnoId)).data.data || [],
        enabled: !!alumnoId,
    });

    const { data: candidateAccounts = [], isLoading: loadingCandidates } = useQuery({
        queryKey: ['responsables-candidatos', alumnoId],
        queryFn: async () => (await alumnosAPI.getResponsablesCandidates(alumnoId)).data.data || [],
        enabled: !!alumnoId && expanded && form.mode === 'existing',
    });

    const availableAccounts = candidateAccounts.filter((account) => Number(account.ya_vinculado) !== 1);
    const selectedAccount = availableAccounts.find((account) => String(account.usuario_id) === String(form.usuario_id));
    const splitStudentNames = (value) => value ? value.split('||').filter(Boolean) : [];

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['alumno-responsables', alumnoId] });
        queryClient.invalidateQueries({ queryKey: ['responsables-candidatos', alumnoId] });
    };

    const addMutation = useMutation({
        mutationFn: (data) => alumnosAPI.addResponsable(alumnoId, data),
        onSuccess: (response) => {
            toast.success(response.data.message || 'Cuenta vinculada correctamente');
            setForm(initialForm);
            setExpanded(false);
            refresh();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudo vincular la cuenta'),
    });

    const mergeMutation = useMutation({
        mutationFn: (usuarioId) => alumnosAPI.mergeFamilyAccount(alumnoId, usuarioId),
        onSuccess: (response) => {
            toast.success(response.data.message || 'Perfiles unificados correctamente');
            setForm(initialForm);
            setExpanded(false);
            refresh();
            queryClient.invalidateQueries({ queryKey: ['alumnos'] });
        },
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudieron unificar los perfiles'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ usuarioId, data }) => alumnosAPI.updateResponsable(alumnoId, usuarioId, data),
        onSuccess: () => {
            toast.success('Responsable actualizado');
            refresh();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudo actualizar'),
    });

    const removeMutation = useMutation({
        mutationFn: (usuarioId) => alumnosAPI.removeResponsable(alumnoId, usuarioId),
        onSuccess: (response) => {
            toast.success(response.data.message || 'Acceso eliminado');
            refresh();
        },
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudo eliminar el acceso'),
    });

    const submit = (event) => {
        event.preventDefault();
        const data = { ...form };
        delete data.mode;
        if (form.mode === 'existing') {
            if (!form.usuario_id) {
                toast.error('Selecciona la cuenta de la madre, padre o responsable');
                return;
            }
            delete data.email;
            delete data.nombre;
            delete data.apellido;
            delete data.telefono;
            delete data.password;
        } else {
            delete data.usuario_id;
        }
        addMutation.mutate(data);
    };

    const mergeSelectedAccount = () => {
        if (!selectedAccount) {
            toast.error('Selecciona la cuenta con la que deseas ingresar');
            return;
        }
        const accountName = `${selectedAccount.nombre || ''} ${selectedAccount.apellido || ''}`.trim();
        const confirmed = window.confirm(
            `¿Unificar los perfiles y conservar solamente el acceso de ${accountName || selectedAccount.email}?\n\n` +
            `Se ingresará con ${selectedAccount.email}. La otra cuenta dejará de iniciar sesión, pero no se borrarán la alumna, sus pagos, clases ni asistencias.`
        );
        if (confirmed) mergeMutation.mutate(selectedAccount.usuario_id);
    };

    return (
        <section className="card">
            <div className="card-header border-b border-gray-200 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlusIcon className="h-5 w-5 text-sds-red" />
                        Cuentas familiares con acceso
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Una cuenta puede estar vinculada a varios hermanos y una alumna puede tener varios responsables.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    className="btn btn-primary btn-sm whitespace-nowrap"
                >
                    {expanded ? 'Cancelar' : 'Agregar cuenta'}
                </button>
            </div>

            <div className="card-body space-y-3">
                {isLoading ? (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ) : responsables.length ? responsables.map((responsable) => (
                    <div key={responsable.usuario_id} className="rounded-xl border border-gray-200 p-3 sm:flex sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{responsable.nombre} {responsable.apellido}</p>
                                {Number(responsable.es_principal) === 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                        <StarIcon className="h-3.5 w-3.5" /> Principal
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500"><EnvelopeIcon className="h-4 w-4" />{responsable.email}</p>
                            <p className="mt-1 text-xs text-gray-500">
                                {responsable.parentesco || 'Responsable'} · {Number(responsable.puede_ver_pagos) ? 've pagos' : 'sin acceso a pagos'} · {Number(responsable.recibe_notificaciones) ? 'recibe avisos' : 'sin avisos'}
                            </p>
                            {splitStudentNames(responsable.otros_alumnos).length > 0 && (
                                <p className="mt-1 text-xs font-medium text-blue-700">
                                    También tiene acceso a: {splitStudentNames(responsable.otros_alumnos).join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 sm:mt-0">
                            {Number(responsable.es_principal) !== 1 && (
                                <button
                                    type="button"
                                    onClick={() => updateMutation.mutate({ usuarioId: responsable.usuario_id, data: { es_principal: true } })}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Hacer principal
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`¿Quitar el acceso de ${responsable.nombre}? La cuenta no se eliminará.`)) {
                                        removeMutation.mutate(responsable.usuario_id);
                                    }
                                }}
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                title="Quitar acceso"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Todavía no hay una cuenta familiar vinculada.</p>
                )}

                {expanded && (
                    <form onSubmit={submit} className="mt-4 rounded-xl border border-sds-red/20 bg-red-50/30 p-4 space-y-4">
                        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                            <label className="flex items-center gap-2"><input type="radio" checked={form.mode === 'existing'} onChange={() => setForm((prev) => ({ ...prev, mode: 'existing' }))} /> Vincular una cuenta existente</label>
                            <label className="flex items-center gap-2"><input type="radio" checked={form.mode === 'new'} onChange={() => setForm((prev) => ({ ...prev, mode: 'new' }))} /> Crear una cuenta nueva</label>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {form.mode === 'existing' ? (
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Cuenta existente</label>
                                    <select
                                        required
                                        value={form.usuario_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, usuario_id: e.target.value }))}
                                        className="input mt-1 w-full"
                                        disabled={loadingCandidates}
                                    >
                                        <option value="">{loadingCandidates ? 'Cargando cuentas...' : 'Selecciona por nombre o email'}</option>
                                        {availableAccounts.map((account) => {
                                            const children = splitStudentNames(account.alumnos_nombres);
                                            return (
                                                <option key={account.usuario_id} value={account.usuario_id}>
                                                    {account.nombre} {account.apellido} — {account.email}{children.length ? ` — acceso a ${children.join(', ')}` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {!loadingCandidates && availableAccounts.length === 0 && (
                                        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                            No quedan otras cuentas activas para vincular. Puedes crear una cuenta nueva.
                                        </p>
                                    )}
                                    {selectedAccount && (
                                        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                                            <p className="font-semibold">Vas a dar acceso a {selectedAccount.nombre} {selectedAccount.apellido}</p>
                                            <p className="mt-0.5 text-xs text-blue-700">{selectedAccount.email}</p>
                                            {splitStudentNames(selectedAccount.alumnos_nombres).length > 0 && (
                                                <p className="mt-1 text-xs">
                                                    Esta cuenta ya ve a: {splitStudentNames(selectedAccount.alumnos_nombres).join(', ')}
                                                </p>
                                            )}
                                            <p className="mt-2 border-t border-blue-200 pt-2 text-xs font-medium text-blue-900">
                                                Si eliges unificar, esta será la única cuenta para iniciar sesión y desde ella se podrán seleccionar ambas alumnas.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : <>
                                <label className="text-sm font-medium text-gray-700 sm:col-span-2">Email
                                    <input required type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="input mt-1 w-full" placeholder="madre@ejemplo.com" />
                                </label>
                                <label className="text-sm font-medium text-gray-700">Nombre
                                    <input required value={form.nombre} onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))} className="input mt-1 w-full" />
                                </label>
                                <label className="text-sm font-medium text-gray-700">Apellido
                                    <input required value={form.apellido} onChange={(e) => setForm((prev) => ({ ...prev, apellido: e.target.value }))} className="input mt-1 w-full" />
                                </label>
                                <label className="text-sm font-medium text-gray-700">Teléfono
                                    <input value={form.telefono} onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))} className="input mt-1 w-full" />
                                </label>
                                <label className="text-sm font-medium text-gray-700">Contraseña inicial
                                    <input required type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className="input mt-1 w-full" />
                                    <span className="mt-1 block text-xs font-normal text-gray-500">9+ caracteres, mayúscula, número y símbolo.</span>
                                </label>
                            </>}
                            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Parentesco / relación
                                <input value={form.parentesco} onChange={(e) => setForm((prev) => ({ ...prev, parentesco: e.target.value }))} className="input mt-1 w-full" placeholder="Madre, padre, tutor..." />
                            </label>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.es_principal} onChange={(e) => setForm((prev) => ({ ...prev, es_principal: e.target.checked }))} /> <StarIcon className="h-4 w-4" /> Cuenta principal</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.recibe_notificaciones} onChange={(e) => setForm((prev) => ({ ...prev, recibe_notificaciones: e.target.checked }))} /> <BellAlertIcon className="h-4 w-4" /> Recibe avisos</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.puede_ver_pagos} onChange={(e) => setForm((prev) => ({ ...prev, puede_ver_pagos: e.target.checked }))} /> Puede ver pagos</label>
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.puede_confirmar_asistencia} onChange={(e) => setForm((prev) => ({ ...prev, puede_confirmar_asistencia: e.target.checked }))} /> Puede confirmar asistencia</label>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                            {form.mode === 'existing' && (
                                <button
                                    disabled={mergeMutation.isPending || !selectedAccount}
                                    className="btn btn-primary inline-flex items-center gap-2"
                                    type="button"
                                    onClick={mergeSelectedAccount}
                                >
                                    <ArrowsPointingInIcon className="h-4 w-4" />
                                    {mergeMutation.isPending ? 'Unificando...' : 'Unificar en una sola cuenta'}
                                </button>
                            )}
                            <button disabled={addMutation.isPending} className="btn btn-secondary" type="submit">
                                {addMutation.isPending ? 'Guardando...' : form.mode === 'new' ? 'Crear y vincular cuenta' : 'Solo compartir acceso'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ResponsablesPanel;
