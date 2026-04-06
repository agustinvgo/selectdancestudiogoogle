/**
 * Script de Restauración de Backup
 * Uso: node scripts/restore_backup.js [nombre_archivo.sql]
 * sin argumento = lista los backups disponibles
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const backupDir = path.join(__dirname, '../backups');
const mysqlPath = process.env.MYSQL_PATH || 'mysql';

function listBackups() {
    if (!fs.existsSync(backupDir)) {
        console.log('❌ No existe la carpeta de backups.');
        return [];
    }

    const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.log('ℹ️ No hay backups disponibles.');
        return [];
    }

    console.log('\n📦 Backups disponibles:\n');
    files.forEach((file, i) => {
        const stats = fs.statSync(path.join(backupDir, file));
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString('es-AR');
        console.log(`  ${i + 1}. ${file} (${sizeMB} MB) — ${date}`);
    });
    console.log(`\n💡 Uso: node scripts/restore_backup.js ${files[0]}`);
    return files;
}

function restoreBackup(fileName) {
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Archivo no encontrado: ${filePath}`);
        process.exit(1);
    }

    const dbName = process.env.DB_NAME || 'select_dance_db';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbHost = process.env.DB_HOST || 'localhost';

    const passwordFlag = dbPassword ? `--password=${dbPassword}` : '';
    const cmd = `"${mysqlPath}" --user=${dbUser} ${passwordFlag} --host=${dbHost} ${dbName} < "${filePath}"`;

    console.log(`\n🔄 Restaurando backup: ${fileName}...`);
    console.log(`   Base de datos: ${dbName}@${dbHost}`);
    console.log(`   Archivo: ${filePath}\n`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error restaurando backup: ${error.message}`);
            if (stderr) console.error(`   Detalle: ${stderr}`);
            process.exit(1);
        }
        console.log(`✅ Backup restaurado exitosamente: ${fileName}`);
        console.log('⚠️ Reiniciá el servidor para que tome los cambios: pm2 restart sds-backend');
    });
}

// Main
const arg = process.argv[2];
if (arg) {
    restoreBackup(arg);
} else {
    listBackups();
}
