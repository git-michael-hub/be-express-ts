import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    // Remove this line:
    // setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/coverage/',
      '/src/tests/'
    ],
    testTimeout: 30000,
    verbose: false,
    silent: true, // Suppress console output
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    },
    // Global setup and teardown
    // globalSetup: '<rootDir>/src/tests/global-setup.ts',
    // globalTeardown: '<rootDir>/src/tests/global-teardown.ts',
    // Test setup
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    // Add HTML reporter configuration
    reporters: [
        'default',
        [
            'jest-html-reporter',
            {
                pageTitle: 'Test Report',
                outputPath: './test-report.html',
                includeFailureMsg: false,
                includeConsoleLog: false,
                includeStackTrace: false,
                darkTheme: false,
                sort: 'status'
            }
        ]
    ]
  };

export default config;