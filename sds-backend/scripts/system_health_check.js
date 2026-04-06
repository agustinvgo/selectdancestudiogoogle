const db = require('../src/config/db');
const PagosModel = require('../src/models/pagos.model');

async function runHealthCheck() {
    console.log('🏥 INICIANDO CHEQUEO DE SALUD DEL SISTEMA SDS...\n');
    let errors = 0;

    // 1. Database Connection
    try {
        await db.query('SELECT 1');
        console.log('✅ Base de Datos: CONECTADA');
    } catch (e) {
        console.error('❌ Base de Datos: ERROR DE CONEXIÓN', e.message);
        errors++;
        process.exit(1); // Cannot proceed without DB
    }

    // 2. Dashboard Vital Logic (Financials)
    try {
        const stats = await PagosModel.getEstadoFinanciero();
        console.log('✅ Lógica Financiera (Dashboard): OK');
        console.log(`   - Total Cobrado (Mes Actual): $${stats.cobradoMes}`);
        console.log(`   - Total Pendiente (Mes Actual): $${stats.pendientes}`);
    } catch (e) {
        console.error('❌ Lógica Financiera: FALLÓ', e.message);
        errors++;
    }

    // 3. Advanced Stats (Graphs)
    try {
        const advStats = await PagosModel.getEstadisticasAvanzadas();
        console.log('✅ Estadísticas Avanzadas (Gráficos): OK');

        // Data Integrity Check for Payment Methods
        const methods = advStats.metodosPago;
        const validMethods = methods.filter(m => m.metodo && m.metodo !== 'No especificado');
        if (validMethods.length > 0) {
            console.log(`   - Métodos de Pago detectados: ${validMethods.map(m => m.metodo).join(', ')}`);
        } else {
            console.log('   ⚠️ Alerta: No se detectaron métodos de pago definidos (posiblemente solo "No especificado" o sin datos).');
        }
    } catch (e) {
        console.error('❌ Estadísticas Avanzadas: FALLÓ', e.message);
        errors++;
    }

    // 4. Critical Data Tables Check
    try {
        const [alumnos] = await db.query('SELECT COUNT(*) as c FROM alumnos');
        const [pagos] = await db.query('SELECT COUNT(*) as c FROM pagos');
        const [cursos] = await db.query('SELECT COUNT(*) as c FROM cursos');
        console.log('✅ Tablas Críticas: OK');
        console.log(`   - Alumnos: ${alumnos[0].c}`);
        console.log(`   - Pagos: ${pagos[0].c}`);
        console.log(`   - Cursos: ${cursos[0].c}`);
    } catch (e) {
        console.error('❌ Tablas Críticas: ERROR DE LECTURA', e.message);
        errors++;
    }

    // 5. Recent Fix Verification (Feb Payments in Feb)
    try {
        // Check for any payment with fecha_vencimiento in Feb 2026 that is PAID
        const [febPayments] = await db.query(`
            SELECT COUNT(*) as c FROM pagos 
            WHERE MONTH(fecha_vencimiento) = 2 
            AND YEAR(fecha_vencimiento) = 2026 
            AND estado = 'pagado'
        `);

        if (febPayments[0].c > 0) {
            console.log(`✅ Verificación de Lógica de Febrero: OK (${febPayments[0].c} pagos pagados de Febrero encontrados)`);
        } else {
            console.log('ℹ️ Verificación de Febrero: No hay pagos PAGADOS de Febrero 2026 aún para verificar (esto es normal si no has marcado ninguno).');
        }
    } catch (e) {
        console.error('❌ Verificación Febrero: FALLÓ', e.message);
        errors++;
    }

    console.log('\n----------------------------------------');
    if (errors === 0) {
        console.log('🎉 EL SISTEMA ESTÁ SALUDABLE. Todas las pruebas internas pasaron.');
        process.exit(0);
    } else {
        console.error(`⚠️ SE ENCONTRARON ${errors} PROBLEMAS. Revisa el log anterior.`);
        process.exit(1);
    }
}

runHealthCheck();
