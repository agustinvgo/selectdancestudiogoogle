const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../src/config/db'); // Assuming this exports db connection info or we can hardcode for XAMPP

// Configuration
const DB_USER = 'root';
const DB_PASS = ''; // Default XAMPP has no password
const DB_NAME = 'selectdancestudiogoogle';
const BACKUP_DIR = path.join(__dirname, '../backups');
const MYSQLDUMP_PATH = 'C:\\xampp\\mysql\\bin\\mysqldump.exe'; // Standard XAMPP path

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

const date = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `${DB_NAME}_backup_${date}.sql`);

console.log(`📦 Iniciando respaldo de ${DB_NAME}...`);

// Construct command
const cmd = `"${MYSQLDUMP_PATH}" -u ${DB_USER} ${DB_NAME} > "${backupFile}"`;

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error al crear respaldo: ${error.message}`);
        // Fallback: Try 'mysqldump' if global path
        const fallbackCmd = `mysqldump -u ${DB_USER} ${DB_NAME} > "${backupFile}"`;
        console.log('🔄 Intentando con comando global mysqldump...');

        exec(fallbackCmd, (err2, out2, stderr2) => {
            if (err2) {
                console.error(`❌ Falló también el método global: ${err2.message}`);
                return;
            }
            console.log(`✅ Respaldo creado exitosamente (Global): ${backupFile}`);
        });
        return;
    }
    console.log(`✅ Respaldo creado exitosamente: ${backupFile}`);
});
