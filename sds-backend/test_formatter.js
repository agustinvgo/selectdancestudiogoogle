const { formatSchedule } = require('./src/utils/formatters');

const testStrings = [
    'S |-íbado 10:00:00',
    'S  |-  íbado 11:30:00',
    'S-íbado 09:00',
    'Mi |- rcoles 15:00',
    'Mi├®rcoles 18:00:00',
    'Lunes 10:00:00',
    'Sábado 10:00:00'
];

console.log('🧪 Testing REFINED formatSchedule:');
testStrings.forEach(s => {
    console.log(`Original: "${s}" -> Clean: "${formatSchedule(s)}"`);
});
