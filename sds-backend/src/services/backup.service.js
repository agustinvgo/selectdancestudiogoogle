const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');
        // Prioritize ENV variable, then 'mysqldump' (global), then XAMPP fallback
        this.mysqldumpPath = process.env.MYSQLDUMP_PATH || 'mysqldump';

        // If on Windows and using XAMPP default without ENV, we can try to smart-detect or keep fallback
        const isWindows = process.platform === 'win32';
        if (isWindows && !process.env.MYSQLDUMP_PATH) {
            // Fallback to XAMPP if 'mysqldump' isn't in PATH (common in local dev)
            if (fs.existsSync('C:\\xampp\\mysql\\bin\\mysqldump.exe')) {
                this.mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
            }
        }

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    // Initialize the scheduler
    init() {
        console.log('⏰ Sistema de Respaldos Automáticos: INICIADO');
        console.log('   - Programación: Todos los días a las 03:00 AM');

        // Schedule for 03:00 AM daily
        cron.schedule('0 3 * * *', () => {
            console.log('⏰ Ejecutando respaldo automático programado...');
            this.performBackup();
        });
    }

    performBackup() {
        const dbName = process.env.DB_NAME || 'select_dance_db';
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbHost = process.env.DB_HOST || 'localhost';

        const date = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${dbName}_backup_${date}.sql`;
        const filePath = path.join(this.backupDir, fileName);

        // Use --password with env var; if empty, omit (no -p flag)
        const passwordFlag = dbPassword ? `--password=${dbPassword}` : '--password=';
        const cmd = `"${this.mysqldumpPath}" --user=${dbUser} ${passwordFlag} --host=${dbHost} --result-file="${filePath}" --databases ${dbName}`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error en respaldo automático: ${error.message}`);
                console.error(`   Stderr: ${stderr}`);
                return;
            }
            console.log(`✅ Respaldo automático completado: ${fileName}`);

            // Cleanup old backups (keep last 7 days)
            this.cleanupOldBackups();
        });
    }

    cleanupOldBackups() {
        fs.readdir(this.backupDir, (err, files) => {
            if (err) return;

            const now = Date.now();
            const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(this.backupDir, file);
                fs.stat(filePath, (err, stat) => {
                    if (err) return;
                    if (now - stat.mtime.getTime() > SEVEN_DAYS) {
                        fs.unlink(filePath, () => console.log(`🗑️ Respaldo antiguo eliminado: ${file}`));
                    }
                });
            });
        });
    }
}

module.exports = new BackupService();
