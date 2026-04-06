const bcrypt = require('bcryptjs');
const pass = 'Select2026!';
bcrypt.hash(pass, 10).then(console.log);
