/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const quibble = require('quibble');
const sinon = require('sinon');
const path = require('path');

describe('lib/helpers/loader', () => {
	describe('loadReporter', () => {

		before(() => {
			sinon.stub(console, 'log');
		});

		after(() => {
			console.log.restore();
		});

		it('resolves npm modules', () => {
			const loadReporter = require('../../../lib/helpers/loader');
			const mock = {};
			quibble('my-reporter', mock);
			const reporter = loadReporter('my-reporter');

			assert.equal(reporter, mock);
		});

		it('resolves local modules', () => {
			const mock = {};
			quibble('fs', {
				existsSync: () => true
			});
			const loadReporter = require('../../../lib/helpers/loader');

			quibble(path.join(process.cwd(), '/my-reporter.js'), mock);
			const reporter = loadReporter('my-reporter.js');

			assert.equal(reporter, mock);

		});

		it('returns undefined if module is not resolved', () => {
			const loadReporter = require('../../../lib/helpers/loader');

			const reporter = loadReporter('my-reporter.js');

			assert.isUndefined(reporter);
		});

	});
});
