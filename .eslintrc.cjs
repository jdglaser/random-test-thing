module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true
}
