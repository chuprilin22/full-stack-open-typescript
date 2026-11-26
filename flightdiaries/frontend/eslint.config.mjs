import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config({
  files: ['**/*.{ts,tsx}'],
  extends: [eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
  },
  plugins: { '@stylistic': stylistic },
  rules: {
    '@stylistic/semi': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
  },
});
