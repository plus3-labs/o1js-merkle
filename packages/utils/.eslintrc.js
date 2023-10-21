module.exports = {
    root: true,

    extends: [
        '../../.eslintrc.node.js',
    ],

    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
        sourceType: 'module',
    }
};
