/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const path = require('path');

describe('lib/helpers', () => {
	describe('resolveReporters', () => {

		it('omits non-string values', () => {
			const {resolveReporters} = require('../../../lib/helpers');
			const reporters = resolveReporters([false, null, undefined]);
			assert.equal(reporters.length, 0);
		});
		it('resolves npm modules', async () => {
			const {resolveReporters} = require('../../../lib/helpers');
			const mock = {results: sinon.spy()};
			mockery.registerMock('my-reporter', mock);
			const reporters = resolveReporters('my-reporter');

			await reporters[0].results();
			assert.calledOnce(mock.results);
		});

		it('resolves local modules', async () => {
			const mock = {results: sinon.spy()};
			mockery.registerMock('fs', {
				existsSync: () => true
			});
			const {resolveReporters} = require('../../../lib/helpers');

			mockery.registerMock(path.join(process.cwd(), '/my-reporter.js'), mock);
			const reporters = resolveReporters('my-reporter.js');

			await reporters[0].results();
			assert.calledOnce(mock.results);
		});

		it('returns undefined if local modules is not resolved', () => {
			const {resolveReporters} = require('../../../lib/helpers');

			const reporters = resolveReporters('my-reporter.js');

			assert.equal(reporters.length, 0);
		});

		it('enhances reporters with pa11y buildReporter', () => {
			const mock = {results: sinon.spy()};
			const buildStub = sinon.stub().returns(mock);
			mockery.registerMock('pa11y/lib/reporter', buildStub);
			mockery.registerMock('my-reporter', mock);
			const {resolveReporters} = require('../../../lib/helpers');

			const reporters = resolveReporters('my-reporter');

			assert.strictEqual(reporters[0].results, mock.results);
		});

		it('rewrites results method to allow multiple arguments', async () => {
			const mock = {results: sinon.stub().returns(true)};
			const logSpy = sinon.spy(console, 'log');
			mockery.registerMock('my-reporter', mock);
			const {resolveReporters} = require('../../../lib/helpers');

			const reporters = resolveReporters('my-reporter');

			await reporters[0].results(1, 2, 3);

			assert.calledWith(mock.results, 1, 2, 3);
			assert.calledWith(logSpy, true);

			console.log.restore();
		});


	});
});
