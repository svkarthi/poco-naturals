const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'release-output/*',
      'node_modules/*',
      'plugins/*',
      'jest.setup.js',
    ],
  },
];
