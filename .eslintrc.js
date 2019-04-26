module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  env: {
    commonjs: true,
    mocha: true
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }]
  }
};
