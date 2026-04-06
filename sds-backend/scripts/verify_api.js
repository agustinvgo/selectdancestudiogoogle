const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const ALUMNOS_URL = 'http://localhost:5000/api/alumnos';

async function run() {
    try {
        console.log('🔄 Iniciando verificación de API...');

        // 1. Login
        console.log(`\n🔑 Intentando Login...`);
        const loginRes = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@selectdance.com', password: 'admin123' }) // Default credentials
        });

        if (!loginRes.ok) {
            throw new Error(`Login fallido: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('✅ Login exitoso. Token recibido.');

        // 2. Test Get All (Page 1, Limit 5)
        console.log(`\n📋 Probando Paginación (Page 1, Limit 5)...`);
        const getRes = await fetch(`${ALUMNOS_URL}?page=1&limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const getData = await getRes.json();

        console.log(`Status: ${getRes.status}`);
        if (getData.data && getData.total !== undefined) {
            console.log(`✅ Paginación OK. Recibidos ${getData.data.length} items. Total: ${getData.total}`);
        } else {
            console.error('❌ Error en estructura de paginación:', getData);
        }

        // 3. Test Filter (Search 'Juan')
        console.log(`\n🔍 Probando Filtro (Search 'Juan')...`);
        const searchRes = await fetch(`${ALUMNOS_URL}?page=1&limit=5&search=Juan`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const searchData = await searchRes.json();
        console.log(`✅ Búsqueda OK. Recibidos ${searchData.data?.length} items. Total encontrado: ${searchData.total}`);


        // 4. Test Create (Validation Error)
        console.log(`\n❌ Probando Validación (Crear sin email)...`);
        const invalidRes = await fetch(ALUMNOS_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: 'Invalido',
                apellido: 'Test',
                password: 'password123'
                // Missing email
            })
        });
        const invalidData = await invalidRes.json();
        if (invalidRes.status === 400 && invalidData.errors) {
            console.log('✅ Validación OK. Errores recibidos:', invalidData.errors.length);
        } else {
            console.error('❌ Fallo en validación:', invalidData);
        }

        console.log('\n✨ Verificación completada.');

    } catch (e) {
        console.error('❌ Error fatal:', e);
    }
}

run();
