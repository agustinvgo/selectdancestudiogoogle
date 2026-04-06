// Setup de pruebas - Variables de entorno mock
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_NAME = 'test_db';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.PORT = '5001';
