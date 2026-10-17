/* eslint max-len: 'off' */
'use strict';

const path = require('path');
const assert = require('proclaim');

describe('pa11y-ci (with the `--json` flag set)', () => {

	before(() => {
		return global.cliCall([
			'--json',
			'--threshold',
			'100',
			'--config',
			'mixed'
		]);
	});

	it('exits with 2 when execution fails even with accessibility errors below the CLI threshold', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs the results as JSON', () => {
		const outputData = JSON.parse(global.lastResult.stdout);
		const filePath = path.resolve(__dirname, 'mock/config/foo/erroring.html');
		assert.deepEqual(outputData, {
			total: 3,
			errors: 1,
			passes: 1,
			failures: 1,
			results: {
				'./foo/erroring.html': [
					{
						message: `net::ERR_FILE_NOT_FOUND at file://${filePath}`
					}
				],
				'http://localhost:8090/failing-1': [
					{
						code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
						context: '<html><head>\n\t<meta charset="utf-8">\n...</html>',
						message: 'The html element should have a lang or xml:lang attribute which describes the language of the document.',
						runner: 'htmlcs',
						runnerExtras: {},
						selector: 'html',
						type: 'error',
						typeCode: 1
					}
				],
				'http://localhost:8090/passing-1': []
			}
		});
	});

});

describe('pa11y-ci (with JSON output for a passing URL)', () => {
	before(() => {
		return global.cliCall(['--json', '--config', 'passing-single', '--threshold', '100']);
	});

	it('exits with 0 and reports zero failed executions', () => {
		const report = JSON.parse(global.lastResult.stdout);
		assert.strictEqual(global.lastResult.code, 0);
		assert.strictEqual(report.total, 1);
		assert.strictEqual(report.passes, 1);
		assert.strictEqual(report.errors, 0);
		assert.strictEqual(report.failures, 0);
	});
});
