module.exports = {
    root: true,
    
    parser: '@typescript-eslint/parser',

    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],

    env: {
        es6: true,
        browser: true,
        node: true
    },

    plugins: [
        '@typescript-eslint',
    ],

    ignorePatterns: [
        '_vite',
        '.eslintrc.*',
        'node_modules',
        'dist',
        'build',
    ],

    rules:{
        'prettier/prettier': ['warn', {
            tabWidth: 4,
            singleQuote: true,
            endOfLine: 'auto',
            printWidth: 110,
        }],

        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',

        semi: ['error', 'always'],
        quotes: ['warn', 'single', { allowTemplateLiterals: true }],
    }
};
