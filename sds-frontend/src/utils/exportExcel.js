import * as XLSX from 'xlsx';

/**
 * Utilidad para exportar datos a Excel
 */

// Exportar array de objetos a Excel
export const exportToExcel = (data, filename = 'export') => {
    // Crear un nuevo workbook
    const wb = XLSX.utils.book_new();

    // Convertir el array de objetos a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');

    // Generar el archivo y descargarlo
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Exportar lista de alumnos
export const exportAlumnos = (alumnos) => {
    const data = alumnos.map(alumno => ({
        'ID': alumno.id,
        'Nombre': alumno.nombre,
        'Apellido': alumno.apellido,
        'DNI': alumno.dni,
        'Fecha Nacimiento': alumno.fecha_nacimiento,
        'Email': alumno.email,
        'Teléfono': alumno.telefono,
        'Email Padre': alumno.email_padre,
        'Dirección': alumno.direccion,
        'Activo': alumno.activo ? 'Sí' : 'No',
        'Fecha Registro': new Date(alumno.fecha_registro).toLocaleDateString('es-AR')
    }));

    exportToExcel(data, 'alumnos');
};

// Exportar asistencias
export const exportAsistencias = (asistencias, titulo = 'asistencias') => {
    const data = asistencias.map(asist => ({
        'Fecha': new Date(asist.fecha).toLocaleDateString('es-AR'),
        'Alumno': `${asist.nombre || ''} ${asist.apellido || ''}`,
        'Curso': asist.curso_nombre || asist.curso,
        'Estado': asist.presente ? 'Presente' : 'Ausente',
        'Observaciones': asist.observaciones || '-'
    }));

    exportToExcel(data, titulo);
};

// Exportar pagos enriquecidos
export const exportPagos = (pagos, alumnos = []) => {
    // Mapa de alumnos para búsqueda rápida por ID
    const alumnosMap = alumnos.reduce((map, alumno) => {
        map[alumno.id] = alumno;
        return map;
    }, {});

    const data = pagos.map(pago => {
        const alumnoInfo = alumnosMap[pago.alumno_id] || {};
        const montoBase = parseFloat(pago.monto_original || pago.monto) || 0;
        const recargo = parseFloat(pago.recargo_aplicado || 0) || 0;
        const descuento = parseFloat(pago.descuento_aplicado || 0) || 0;
        const total = (montoBase + recargo) - descuento;

        return {
            'ID Pago': pago.id,
            'Alumno': `${pago.alumno_nombre || alumnoInfo.nombre || ''} ${pago.alumno_apellido || alumnoInfo.apellido || ''}`.trim() || 'Sin Nombre',
            'DNI': alumnoInfo.dni || '-',
            'Teléfono': alumnoInfo.telefono || '-',
            'Email Padre': alumnoInfo.email_padre || '-',
            'Concepto': pago.concepto || '-',
            'Curso': pago.curso_nombre || '-',
            'Periodo': `${pago.mes ? pago.mes : ''}/${pago.anio ? pago.anio : ''}`.replace(/^\/|\/$/, '') || '-',
            'Monto Base': montoBase,
            'Recargo (+)': recargo,
            'Descuento (-)': descuento,
            'Total Final': total,
            'Estado': (pago.estado || 'PENDIENTE').toUpperCase(),
            'Fecha Vencimiento': pago.fecha_vencimiento ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR') : '-',
            'Fecha de Pago': pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : '-',
            'Método Pago': pago.metodo_pago_realizado || pago.metodo_pago || '-',
            'Referencia/Notas': pago.notas_pago || pago.observaciones || '-'
        };
    });

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columna automáticamente
    const colWidths = [
        { wch: 8 },  // ID
        { wch: 25 }, // Alumno
        { wch: 12 }, // DNI
        { wch: 15 }, // Teléfono
        { wch: 25 }, // Email Padre
        { wch: 20 }, // Concepto
        { wch: 20 }, // Curso
        { wch: 10 }, // Periodo
        { wch: 12 }, // Monto Base
        { wch: 12 }, // Recargo
        { wch: 12 }, // Descuento
        { wch: 12 }, // Total Final
        { wch: 12 }, // Estado
        { wch: 15 }, // Vencimiento
        { wch: 15 }, // Fecha Pago
        { wch: 15 }, // Método
        { wch: 30 }  // Notas
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listado de Pagos');

    const fechaStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Pagos_Estudio_${fechaStr}.xlsx`);
};

// Exportar cursos
export const exportCursos = (cursos) => {
    const data = cursos.map(curso => ({
        'ID': curso.id,
        'Nombre': curso.nombre,
        'Nivel': curso.nivel,
        'Descripción': curso.descripcion || '-',
        'Día': curso.horario_dia,
        'Hora': curso.horario_hora,
        'Duración (min)': curso.duracion_minutos,
        'Profesor': curso.profesor || '-',
        'Cupo Máximo': curso.cupo_maximo,
        'Alumnos Inscritos': curso.alumnos_count || curso.inscritos?.length || 0,
        'Activo': curso.activo ? 'Sí' : 'No'
    }));

    exportToExcel(data, 'cursos');
};

// Exportar eventos
export const exportEventos = (eventos) => {
    const data = eventos.map(evento => ({
        'ID': evento.id,
        'Nombre': evento.nombre,
        'Tipo': evento.tipo,
        'Descripción': evento.descripcion || '-',
        'Fecha': new Date(evento.fecha).toLocaleDateString('es-AR'),
        'Hora': evento.hora || '-',
        'Lugar': evento.lugar || '-',
        'Costo': evento.costo ? `$${evento.costo}` : '-',
        'Cupo': evento.cupo_maximo || '-',
        'Inscritos': evento.inscritos_count || evento.participantes?.length || 0
    }));

    exportToExcel(data, 'eventos');
};

// Exportar con múltiples hojas
export const exportMultiSheet = (sheets, filename = 'reporte') => {
    const wb = XLSX.utils.book_new();

    sheets.forEach(sheet => {
        const ws = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
