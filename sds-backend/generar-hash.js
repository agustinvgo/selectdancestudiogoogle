const bcrypt = require('bcrypt');

async function generarHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('\n===========================================');
    console.log('Hash generado para password: admin123');
    console.log('===========================================');
    console.log(hash);
    console.log('===========================================\n');
}

generarHash();
