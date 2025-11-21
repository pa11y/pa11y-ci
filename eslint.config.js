'use strict';

const {defineConfig} = require('eslint/config');

const configPa11y = require('eslint-config-pa11y');

module.exports = defineConfig([
	configPa11y,
	{
		ignores: [
			'test/integration/mock/config/syntax-errors-js.js'
		]
	}
]);
