const fs = require('fs');
const path = require('path');

function scanDir(dir, pattern, validExtensions = ['.js', '.jsx']) {
    let results = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                results = results.concat(scanDir(fullPath, pattern, validExtensions));
            }
        } else if (validExtensions.includes(path.extname(file))) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(pattern)) {
                    results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
                }
            });
        }
    }
    return results;
}

console.log('--- SCANNING FOR console.log ---');
const frontendLogs = scanDir(path.join(__dirname, '../../sds-frontend/src'), 'console.log');
const backendLogs = scanDir(path.join(__dirname, '../src'), 'console.log');

console.log('Frontend matches:', frontendLogs.length);
frontendLogs.slice(0, 10).forEach(l => console.log(l));
if (frontendLogs.length > 10) console.log('...and more');

console.log('\nBackend matches:', backendLogs.length);
backendLogs.slice(0, 10).forEach(l => console.log(l));
if (backendLogs.length > 10) console.log('...and more');
