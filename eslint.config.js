import js from '@eslint/js';
import globals from 'globals';
export default [
    { ignores: ['backups/**', 'public/data/**', 'scripts/refactor-legacy.cjs'] },
    js.configs.recommended,
    {
        languageOptions: { globals: { ...globals.node, ...globals.browser }, ecmaVersion: 2022 },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-useless-escape': 'off',
        },
    },
    { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs' } },
    { files: ['src/client/features/data-tools.js'], rules: { 'no-useless-catch': 'off' } },
];
