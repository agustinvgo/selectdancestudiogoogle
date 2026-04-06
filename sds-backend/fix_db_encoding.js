const db = require('./src/config/db');

async function fixDatabaseEncoding() {
    console.log('🚀 Iniciando limpieza de codificación en Base de Datos...');
    
    try {
        // 1. Corregir Sábado (todas sus variantes corruptas)
        // Buscamos registros que empiecen con S y tengan caracteres no ASCII o patrones comunes
        const [sabados] = await db.query("SELECT id, dia_semana FROM cursos WHERE dia_semana LIKE 'S%' AND dia_semana NOT LIKE 'Sábado'");
        console.log(`🔍 Encontrados ${sabados.length} registros de Sábado potencialmente corruptos.`);
        
        for (const row of sabados) {
            // Si contiene "íbado" o caracteres de escape, lo arreglamos
            if (row.dia_semana.includes('bado') || row.dia_semana.includes('íbado')) {
                await db.query("UPDATE cursos SET dia_semana = 'Sábado' WHERE id = ?", [row.id]);
                console.log(`✅ ID ${row.id}: ${row.dia_semana} -> Sábado`);
            }
        }

        // 2. Corregir Miércoles
        const [miercoles] = await db.query("SELECT id, dia_semana FROM cursos WHERE dia_semana LIKE 'Mi%' AND dia_semana NOT LIKE 'Miércoles'");
        console.log(`🔍 Encontrados ${miercoles.length} registros de Miércoles potencialmente corruptos.`);
        
        for (const row of miercoles) {
            if (row.dia_semana.includes('rcoles')) {
                await db.query("UPDATE cursos SET dia_semana = 'Miércoles' WHERE id = ?", [row.id]);
                console.log(`✅ ID ${row.id}: ${row.dia_semana} -> Miércoles`);
            }
        }

        console.log('✨ Limpieza completada con éxito.');
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        process.exit();
    }
}

fixDatabaseEncoding();
