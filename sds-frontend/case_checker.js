const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'src');

function getAllFiles(dir, fileList = []) {
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
let errors = 0;

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            
            // Try common extensions
            const extensions = ['', '.js', '.jsx', '.json', '.webp', '.jpg', '.png', '.css'];
            let found = false;
            let exactMatchFound = false;

            for (const ext of extensions) {
                const fullPath = resolvedPath + ext;
                if (fs.existsSync(fullPath)) {
                    found = true;
                    // Check exact case of the filename on disk
                    const dir = path.dirname(fullPath);
                    const base = path.basename(fullPath);
                    const actualFiles = fs.readdirSync(dir);
                    if (actualFiles.includes(base)) {
                        exactMatchFound = true;
                    } else {
                        console.error(`CASE MISMATCH in ${path.relative(srcDir, file)}:`);
                        console.error(`  Import: ${importPath}`);
                        console.error(`  Expected: ${base}`);
                        console.error(`  Found something else on disk (case-insensitive find).`);
                        errors++;
                    }
                    break;
                }
            }
            
            if (!found && !importPath.includes('node_modules')) {
                // Ignore node_modules for this simple script
            }
        }
    }
});

console.log(`Total case errors found: ${errors}`);
if (errors > 0) process.exit(1);
