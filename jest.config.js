/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/packages/',
    '<rootDir>/apps/'
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@ledgerbridge/domain/(.*)$': '<rootDir>/packages/domain/src/$1',
    '^@ledgerbridge/domain$': '<rootDir>/packages/domain/src/index',
    '^@ledgerbridge/ports/(.*)$': '<rootDir>/packages/ports/src/$1',
    '^@ledgerbridge/ports$': '<rootDir>/packages/ports/src/index',
    '^@ledgerbridge/adapters/(.*)$': '<rootDir>/packages/adapters/src/$1',
    '^@ledgerbridge/adapters$': '<rootDir>/packages/adapters/src/index',
    '^@ledgerbridge/infra-postgres/(.*)$': '<rootDir>/packages/infra-postgres/src/$1',
    '^@ledgerbridge/infra-postgres$': '<rootDir>/packages/infra-postgres/src/index',
    '^@ledgerbridge/orchestration/(.*)$': '<rootDir>/packages/orchestration/src/$1',
    '^@ledgerbridge/orchestration$': '<rootDir>/packages/orchestration/src/index',
    '^@ledgerbridge/shared/(.*)$': '<rootDir>/packages/shared/src/$1',
    '^@ledgerbridge/shared$': '<rootDir>/packages/shared/src/index'
  },
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/index.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts'
  ],
  verbose: true
};
