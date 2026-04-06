const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runOptimization() {
    console.log('🚀 Iniciando optimización de base de datos...');

    const sqlPath = path.join(__dirname, '../migrations/optimize_indexes.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('❌ Archivo SQL no encontrado:', sqlPath);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    const queries = sqlContent
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0 && !q.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const query of queries) {
        try {
            // MySQL no soporta IF NOT EXISTS en CREATE INDEX en versiones viejas.
            // Envolvemos en try/catch para ignorar "Duplicate key name" (Error 1061)
            await pool.execute(query);
            console.log(`✅ Ejecutado: ${query.substring(0, 50)}...`);
            successCount++;
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                console.log(`ℹ️ Índice ya existe (Ignorado): ${query.substring(0, 30)}...`);
            } else {
                console.error(`❌ Error ejecutando query: ${query.substring(0, 50)}...`);
                console.error(`   Motivo: ${error.message}`);
                errorCount++;
            }
        }
    }

    console.log(`\n🏁 Optimización finalizada.`);
    console.log(`   Exitosos: ${successCount}`);
    console.log(`   Errores: ${errorCount}`);

    process.exit(0);
}

runOptimization();
