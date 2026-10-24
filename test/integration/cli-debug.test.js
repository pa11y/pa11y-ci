'use strict';

const assert = require('proclaim');

describe('pa11y-ci --debug', () => {
	it('shows the Pa11y debug messages', async () => {
		const result = await global.cliCall(['--config', 'passing-single', '--debug']);
		assert.strictEqual(result.code, 0);
		assert.include(result.stdout, 'Navigating to http://localhost:8090/passing-1');
	});
});
