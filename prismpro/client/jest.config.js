//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
module.exports = {
  testRegex: '.*(\\.test|\\.spec|_spec)\\.(js|jsx)$',
  setupFiles: ['<rootDir>/jest/SetupFiles.js'],
  setupTestFrameworkScriptFile: '<rootDir>/node_modules/prism-jest/src/SetupReactEnzyme.js',
  moduleDirectories: [
    '<rootDir>/node_modules'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@xplay/(.*)$': '<rootDir>/src/pages/xplay/$1',
    '\\.(css|less)$': '<rootDir>/node_modules/prism-jest/src/styleMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!../**/node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    'src/componentLoader.js',
    'src/index.js',
    'src/.*/index.js'
  ],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/pages/settings/': {
      branches: 56,
      functions: 79,
      lines: 67,
      statements: 67
    },
    './src/pages/xplay/': {
      branches: 80,
      functions: 82,
      lines: 85,
      statements: 85
    },
    './src/pages/xnotify/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    },
    './src/pages/ova/': {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  snapshotSerializers: [
    // This allows enzyme wrapper to jest snapshot
    'enzyme-to-json/serializer'
  ],
  transform: {
    '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
    '^(?!.*\\.(js|jsx|mjs|css|json)$)': '<rootDir>/node_modules/prism-jest/src/fileTransform.js'
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'
  ],
  clearMocks: true,
  bail: true
};
