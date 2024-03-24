/**
 * @type {import('@types/eslint').Linter.Config}
 */
module.exports = {
	env: {
		node: true,
		es2023: true,
		browser: true,
	},
	plugins: ['eslint-plugin-import'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2023,
	},
	settings: {
		'import/resolver': {
			node: true,
		},
	},
	rules: {
		'no-undef': 'error',
		'no-duplicate-case': 'error',
		'no-template-curly-in-string': 'warn',
		'no-undef-init': 'error',
		'no-unneeded-ternary': 'error',
		'no-unreachable': 'error',
		'no-unreachable-loop': 'error',
		'no-unsafe-finally': 'error',
		'no-unsafe-negation': 'error',
		'no-unsafe-optional-chaining': 'error',
		'no-unused-expressions': 'error',
		'no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				ignoreRestSiblings: true,
				varsIgnorePattern: '^ignored',
			},
		],
		'no-use-before-define': ['error', 'nofunc'],
		'no-useless-escape': 'error',
		'no-warning-comments': [
			'error',
			{ location: 'anywhere', terms: ['fixme'] },
		],
		strict: 'error',
		'valid-typeof': 'error',
		'import/named': 'error',
		'import/no-unresolved': [
			'error',
			// workaround for
			// https://github.com/import-js/eslint-plugin-import/issues/1810
			{ ignore: ['@kentcdodds/*', 'react-server-dom-esm/*'] },
		],

		'import/no-duplicates': ['warn', { 'prefer-inline': true }],
		'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
		'import/order': [
			'warn',
			{
				alphabetize: { order: 'asc', caseInsensitive: true },
				groups: [
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
				],
			},
		],
	},
}
