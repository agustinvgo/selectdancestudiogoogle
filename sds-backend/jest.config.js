module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.js'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    // No cargar variables de entorno reales en tests
    setupFiles: ['<rootDir>/tests/setup.js']
};
