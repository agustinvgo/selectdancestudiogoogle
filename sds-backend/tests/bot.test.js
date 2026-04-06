const BotIntentHandler = require('../src/services/bot/BotIntentHandler');

describe('BotIntentHandler - Detección de Intenciones', () => {
    test('Detecta CLASE_PRUEBA cuando se menciona "prueba"', () => {
        const result = BotIntentHandler.detectarIntencion('Quiero probar una clase', '');
        expect(result.tipo).toBe('CLASE_PRUEBA');
    });

    test('Detecta CLASE_PRUEBA con "primera clase"', () => {
        const result = BotIntentHandler.detectarIntencion('Me interesa la primera clase', '');
        expect(result.tipo).toBe('CLASE_PRUEBA');
    });

    test('Detecta CONSULTA_PRECIO con "cuánto"', () => {
        const result = BotIntentHandler.detectarIntencion('Cuanto sale la clase?', '');
        expect(result.tipo).toBe('CONSULTA_PRECIO');
    });

    test('Detecta CONSULTA_HORARIO con "que horarios"', () => {
        const result = BotIntentHandler.detectarIntencion('Que horarios tienen?', '');
        expect(result.tipo).toBe('CONSULTA_HORARIO');
    });

    test('Detecta CONSULTA_PAGO con "deuda"', () => {
        const result = BotIntentHandler.detectarIntencion('Tengo deuda?', '');
        expect(result.tipo).toBe('CONSULTA_PAGO');
    });

    test('Devuelve GENERAL para mensajes sin intención clara', () => {
        const result = BotIntentHandler.detectarIntencion('Hola, buen día', 'Hola! Soy Sofía');
        expect(result.tipo).toBe('GENERAL');
    });

    test('Detecta intención en la respuesta del bot también', () => {
        const result = BotIntentHandler.detectarIntencion('Quiero ir', 'Te agendo una clase de prueba');
        expect(result.tipo).toBe('CLASE_PRUEBA');
    });
});
