/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with a single erroring URL)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'erroring-single'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, './foo/erroring.html - Failed to run');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in ./foo/erroring.html');
		assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
	});

	it('outputs a total erroring notice', () => {
		assert.include(global.lastResult.output, '0/1 URLs passed');
	});

});

describe('pa11y-ci (with multiple erroring URLs)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'erroring-multiple'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, './foo/erroring.html - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/timeout - Failed to run');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in ./foo/erroring.html');
		assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/timeout');
		assert.include(global.lastResult.output, 'timeout');
	});

	it('outputs a total erroring notice', () => {
		assert.include(global.lastResult.output, '0/2 URLs passed');
	});

});

[1, 100].forEach(threshold => {
	describe(`pa11y-ci (with an erroring URL and a CLI threshold of ${threshold})`, () => {
		before(() => {
			return global.cliCall(['--config', 'erroring-single', '--threshold', String(threshold)]);
		});

		it('retains the execution error and exits with 2', () => {
			assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
			assert.strictEqual(global.lastResult.code, 2);
		});
	});
});

describe('pa11y-ci (with multiple erroring URLs and a CLI threshold of 100)', () => {
	before(() => {
		return global.cliCall(['--config', 'erroring-multiple', '--threshold', '100']);
	});

	it('attempts both pages, retains their execution errors and exits with 2', () => {
		assert.include(global.lastResult.output, './foo/erroring.html - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/timeout - Failed to run');
		assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
		assert.include(global.lastResult.output, 'timeout');
		assert.strictEqual(global.lastResult.code, 2);
	});
});

describe('pa11y-ci (with an erroring URL and positive page and CLI thresholds)', () => {
	before(() => {
		return global.cliCall(['--config', 'erroring-threshold', '--threshold', '100']);
	});

	it('does not let either threshold excuse the failed execution', () => {
		assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
		assert.strictEqual(global.lastResult.code, 2);
	});
});
