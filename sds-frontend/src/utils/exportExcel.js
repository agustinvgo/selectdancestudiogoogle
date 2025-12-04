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

// Exportar pagos
export const exportPagos = (pagos) => {
    const data = pagos.map(pago => ({
        'ID': pago.id,
        'Alumno': `${pago.alumno_nombre || ''} ${pago.alumno_apellido || ''}`,
        'Concepto': pago.concepto,
        'Monto': `$${pago.monto}`,
        'Estado': pago.estado,
        'Fecha Vencimiento': new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR'),
        'Fecha Pago': pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : '-',
        'Método': pago.metodo_pago || '-',
        'Notas': pago.notas || '-'
    }));

    exportToExcel(data, 'pagos');
};

// Exportar cursos
export const exportCursos = (cursos) => {
    const data = cursos.map(curso => ({
        'ID': curso.id,
        'Nombre': curso.nombre,
        'Nivel': curso.nivel,
        'Día': curso.horario_dia,
        'Hora': curso.horario_hora,
        'Duración (min)': curso.duracion_minutos,
        'Profesor': curso.profesor || '-',
        'Cupo Máximo': curso.cupo_maximo,
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
        'Fecha': new Date(evento.fecha).toLocaleDateString('es-AR'),
        'Hora': evento.hora || '-',
        'Lugar': evento.lugar || '-',
        'Costo': evento.costo ? `$${evento.costo}` : '-',
        'Cupo': evento.cupo_maximo || '-'
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
