const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@selectdance.com';
const ADMIN_PASSWORD = 'admin123';

async function verifyPagos() {
    console.log('🔄 Verificando API de Pagos...');

    try {
        // 1. Login
        console.log('\n🔑 Intentando Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token || loginRes.data.data.token;
        console.log('✅ Login exitoso');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Pagination
        console.log('\n📄 Probando Paginación (Page 1, Limit 5)...');
        const paginatedRes = await axios.get(`${API_URL}/pagos?page=1&limit=5`, { headers });
        console.log(`Status: ${paginatedRes.status}`);
        console.log(`Total items: ${paginatedRes.data.total}`);
        console.log(`Data length: ${paginatedRes.data.data.length}`);

        if (paginatedRes.data.data.length > 0 && paginatedRes.data.data.length <= 5) {
            console.log('✅ Paginación retornó datos correctamente');
        } else if (paginatedRes.data.total === 0) {
            console.log('⚠️ No hay pagos para probar paginación, pero la estructura es correcta');
        } else {
            console.error('❌ Paginación fallida');
        }

        // Check Stats
        if (paginatedRes.data.stats) {
            console.log('✅ Stats presentes:', paginatedRes.data.stats);
            if (typeof paginatedRes.data.stats.total === 'number' && typeof paginatedRes.data.stats.pendientes === 'number') {
                console.log('✅ Estructura de stats correcta');
            } else {
                console.error('❌ Estructura de stats incorrecta');
            }
        } else {
            console.error('❌ Stats faltantes en respuesta');
        }

        // 3. Test Filters (e.g. Current Month)
        const mes = new Date().getMonth() + 1;
        const anio = new Date().getFullYear();
        console.log(`\n🔍 Probando Filtros (Mes: ${mes}, Año: ${anio})...`);
        const filterRes = await axios.get(`${API_URL}/pagos?page=1&limit=5&mes=${mes}&anio=${anio}`, { headers });
        console.log(`Total filtrados: ${filterRes.data.total}`);

        if (filterRes.status === 200) {
            console.log('✅ Filtros respondieron OK');
        }

    } catch (error) {
        console.error('❌ Error en verificación:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyPagos();
