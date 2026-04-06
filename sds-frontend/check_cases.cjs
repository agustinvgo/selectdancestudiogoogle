const fs = require('fs');
const path = require('path');

const srcDir = path.resolve('src');
console.log('Searching in:', srcDir);

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getAllFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    });
    return fileList;
}

const allFiles = getAllFiles(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
console.log('Files to check:', allFiles.length);
let errors = 0;

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // More robust regex for imports
    const importRegex = /from\s+['"](.*?)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            
            // Try common extensions
            const extensions = ['', '.js', '.jsx', '.json', '.webp', '.jpg', '.png', '.css', '.svg'];
            let found = false;

            for (const ext of extensions) {
                const fullPath = resolvedPath + ext;
                if (fs.existsSync(fullPath)) {
                    found = true;
                    // Check exact case of the filename on disk
                    const diskDir = path.dirname(fullPath);
                    const diskBase = path.basename(fullPath);
                    const actualFilesOnDisk = fs.readdirSync(diskDir);
                    
                    if (!actualFilesOnDisk.includes(diskBase)) {
                        console.log(`CASE ERROR in ${path.relative(srcDir, file)}:`);
                        console.log(`  Import:   ${importPath}`);
                        console.log(`  Expected: ${diskBase}`);
                        errors++;
                    }
                    break;
                }
            }
        }
    }
});

console.log(`\nTotal case errors found: ${errors}`);
if (errors > 0) process.exit(1);
