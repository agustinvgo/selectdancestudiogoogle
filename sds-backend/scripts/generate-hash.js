const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
    console.error('Por favor, proporciona la contraseña como argumento.');
    console.error('Uso: node scripts/generate-hash.js <contraseña>');
    process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
    console.log('\n--- HASH GENERADO ---');
    console.log(hash);
    console.log('---------------------\n');
    console.log('Copia este hash y actualiza el campo `password_hash` en tu tabla `usuarios` para el usuario admin.');
}).catch(err => {
    console.error('Error generando hash:', err);
});
