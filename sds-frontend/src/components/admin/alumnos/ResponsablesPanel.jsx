import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlusIcon, TrashIcon, StarIcon, EnvelopeIcon, BellAlertIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { alumnosAPI } from '../../../services/api';
import useToast from '../../../hooks/useToast';

const initialForm = {
    goal: 'parent',
    mode: 'existing',
    usuario_id: '',
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    password: '',
    parentesco: 'Madre / Padre',
    es_principal: false,
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
        enabled: !!alumnoId && expanded && (form.goal === 'siblings' || form.mode === 'existing'),
    });

    const availableAccounts = candidateAccounts.filter((account) => Number(account.ya_vinculado) !== 1);
    const siblingAccounts = availableAccounts.filter((account) => Number(account.alumnos_vinculados) > 0);
    const selectableAccounts = form.goal === 'siblings' ? siblingAccounts : availableAccounts;
    const selectedAccount = selectableAccounts.find((account) => String(account.usuario_id) === String(form.usuario_id));
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
        if (form.goal === 'siblings') {
            mergeSelectedAccount();
            return;
        }
        const data = { ...form };
        delete data.goal;
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
        const children = splitStudentNames(selectedAccount.alumnos_nombres);
        const confirmed = window.confirm(
            `¿Agrupar los perfiles en la cuenta ${selectedAccount.email}?\n\n` +
            `${children.length ? `Esa cuenta ya permite ver a ${children.join(', ')}. ` : ''}` +
            'El correo actual de esta ficha dejará de iniciar sesión. No se borrarán alumnas, pagos, clases ni asistencias.'
        );
        if (confirmed) mergeMutation.mutate(selectedAccount.usuario_id);
    };

    const chooseGoal = (goal) => {
        setForm({
            ...initialForm,
            goal,
            mode: 'existing',
            es_principal: false,
        });
    };

    const toggleExpanded = () => {
        setExpanded((value) => {
            if (value) setForm(initialForm);
            return !value;
        });
    };

    return (
        <section className="card">
            <div className="card-header border-b border-gray-200 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlusIcon className="h-5 w-5 text-sds-red" />
                        Cuentas familiares con acceso
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Revisa quién puede ingresar y qué alumnas puede ver cada correo.</p>
                </div>
                <button
                    type="button"
                    onClick={toggleExpanded}
                    className="btn btn-primary btn-sm whitespace-nowrap"
                >
                    {expanded ? 'Cancelar' : 'Configurar acceso'}
                </button>
            </div>

            <div className="card-body space-y-3">
                {isLoading ? (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ) : responsables.length ? responsables.map((responsable) => (
                    <div key={responsable.usuario_id} className="rounded-xl border border-gray-200 p-3 sm:flex sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="flex items-center gap-1 font-semibold text-gray-900"><EnvelopeIcon className="h-4 w-4" />{responsable.email}</p>
                                {Number(responsable.es_principal) === 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                        <StarIcon className="h-3.5 w-3.5" /> Principal
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">Cuenta registrada como {responsable.nombre} {responsable.apellido}</p>
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
                    <form onSubmit={submit} className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">1. ¿Qué necesitas hacer?</p>
                            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => chooseGoal('parent')}
                                    className={`rounded-xl border-2 p-4 text-left transition ${form.goal === 'parent' ? 'border-sds-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                                        <UserPlusIcon className="h-5 w-5 text-sds-red" />
                                        Agregar otro padre o madre
                                    </span>
                                    <span className="mt-2 block text-xs leading-5 text-gray-600">
                                        Cada adulto conserva su propio correo y ambos ven a esta misma alumna.
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => chooseGoal('siblings')}
                                    className={`rounded-xl border-2 p-4 text-left transition ${form.goal === 'siblings' ? 'border-sds-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                                        <ArrowsPointingInIcon className="h-5 w-5 text-sds-red" />
                                        Usar una cuenta para varios hermanos
                                    </span>
                                    <span className="mt-2 block text-xs leading-5 text-gray-600">
                                        La familia entra con un solo correo y después elige qué hija desea consultar.
                                    </span>
                                </button>
                            </div>
                        </div>

                        {form.goal === 'parent' && (
                            <div>
                                <p className="text-sm font-semibold text-gray-900">2. Elige cómo agregar al responsable</p>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm font-medium text-gray-700">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={form.mode === 'existing'} onChange={() => setForm((prev) => ({ ...prev, mode: 'existing', usuario_id: '' }))} />
                                        Ya tiene una cuenta
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={form.mode === 'new'} onChange={() => setForm((prev) => ({ ...prev, mode: 'new', usuario_id: '' }))} />
                                        Crear una cuenta nueva
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {(form.goal === 'siblings' || form.mode === 'existing') ? (
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-semibold text-gray-900">
                                        {form.goal === 'siblings' ? '2. Cuenta que ya utiliza la familia' : '3. Correo del segundo padre, madre o responsable'}
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {form.goal === 'siblings'
                                            ? 'Solo aparecen cuentas que ya tienen acceso a otra alumna.'
                                            : 'Este correo mantendrá su contraseña y su acceso actual.'}
                                    </p>
                                    <select
                                        required
                                        value={form.usuario_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, usuario_id: e.target.value }))}
                                        className="input mt-2 w-full"
                                        disabled={loadingCandidates}
                                    >
                                        <option value="">{loadingCandidates ? 'Cargando cuentas...' : 'Selecciona una cuenta por correo'}</option>
                                        {selectableAccounts.map((account) => {
                                            const children = splitStudentNames(account.alumnos_nombres);
                                            const accountName = `${account.nombre || ''} ${account.apellido || ''}`.trim();
                                            return (
                                                <option key={account.usuario_id} value={account.usuario_id}>
                                                    {account.email}{children.length ? ` — actualmente ve a ${children.join(', ')}` : accountName ? ` — ${accountName}` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {!loadingCandidates && selectableAccounts.length === 0 && (
                                        <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                            {form.goal === 'siblings'
                                                ? 'No hay otra cuenta con alumnas vinculadas para agrupar.'
                                                : 'No quedan otras cuentas activas. Puedes elegir “Crear una cuenta nueva”.'}
                                        </p>
                                    )}
                                    {selectedAccount && (
                                        <div className={`mt-3 rounded-lg border p-3 text-sm ${form.goal === 'siblings' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-blue-200 bg-blue-50 text-blue-950'}`}>
                                            <p className="font-semibold">Cuenta seleccionada: {selectedAccount.email}</p>
                                            {splitStudentNames(selectedAccount.alumnos_nombres).length > 0 && (
                                                <p className="mt-1 text-xs">Actualmente puede ver a: {splitStudentNames(selectedAccount.alumnos_nombres).join(', ')}</p>
                                            )}
                                            <p className="mt-2 border-t border-current/10 pt-2 text-xs font-medium">
                                                {form.goal === 'siblings'
                                                    ? 'Al confirmar, el correo actual de esta ficha dejará de iniciar sesión. Todos los registros y ambas alumnas se conservan.'
                                                    : 'Al confirmar, se agregará como segundo acceso. La cuenta principal actual seguirá funcionando.'}
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
                        </div>

                        {form.goal === 'parent' && (
                            <>
                                <label className="block text-sm font-medium text-gray-700">Parentesco / relación
                                    <input value={form.parentesco} onChange={(e) => setForm((prev) => ({ ...prev, parentesco: e.target.value }))} className="input mt-1 w-full" placeholder="Madre, padre, tutor..." />
                                </label>
                                <div className="rounded-lg border border-gray-200 bg-white p-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Permisos del nuevo acceso</p>
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={form.es_principal} onChange={(e) => setForm((prev) => ({ ...prev, es_principal: e.target.checked }))} /> <StarIcon className="h-4 w-4" /> Convertir en principal</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={form.recibe_notificaciones} onChange={(e) => setForm((prev) => ({ ...prev, recibe_notificaciones: e.target.checked }))} /> <BellAlertIcon className="h-4 w-4" /> Recibe avisos</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={form.puede_ver_pagos} onChange={(e) => setForm((prev) => ({ ...prev, puede_ver_pagos: e.target.checked }))} /> Puede ver pagos</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" checked={form.puede_confirmar_asistencia} onChange={(e) => setForm((prev) => ({ ...prev, puede_confirmar_asistencia: e.target.checked }))} /> Puede confirmar asistencia</label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end">
                            {form.goal === 'siblings' ? (
                                <button disabled={mergeMutation.isPending || !selectedAccount} className="btn btn-primary inline-flex items-center gap-2" type="submit">
                                    <ArrowsPointingInIcon className="h-4 w-4" />
                                    {mergeMutation.isPending ? 'Agrupando...' : 'Agrupar hermanos en esta cuenta'}
                                </button>
                            ) : (
                                <button disabled={addMutation.isPending || (form.mode === 'existing' && !selectedAccount)} className="btn btn-primary inline-flex items-center gap-2" type="submit">
                                    <UserPlusIcon className="h-4 w-4" />
                                    {addMutation.isPending ? 'Guardando...' : form.mode === 'new' ? 'Crear cuenta y dar acceso' : 'Dar acceso a esta alumna'}
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ResponsablesPanel;
