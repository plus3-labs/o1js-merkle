require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],

  env: {
    "vue/setup-compiler-macros": true,
  },
  
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
