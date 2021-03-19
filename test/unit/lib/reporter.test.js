/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
// Const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/helpers/reporter', () => {
	describe('buildReporter', () => {
		let methods;
		const buildReporter = require('../../../lib/helpers/reporter');


		before(() => {
			sinon.stub(console, 'log');
		});

		after(() => {
			console.log.restore();
		});


		beforeEach(() => {
			methods = {
				supports: '__MOCK__',
				beforeAll: sinon.stub(),
				afterAll: sinon.stub(),
				begin: sinon.stub(),
				results: sinon.stub(),
				debug: sinon.stub(),
				error: sinon.stub(),
				info: sinon.stub()
			};
		});
		it('adds a "report" property', () => {
			const reporter = buildReporter(methods);
			assert.isInstanceOf(reporter.report, Map);
		});

		it('wraps function methods in async functions', () => {
			const reporter = buildReporter(methods);
			assert.isFunction(reporter.beforeAll);
			assert.isFunction(reporter.afterAll);
			assert.isFunction(reporter.begin);
			assert.isFunction(reporter.results);
			assert.isFunction(reporter.log.debug);
			assert.isFunction(reporter.log.error);
			assert.isFunction(reporter.log.info);
			assert.isNotFunction(reporter.support);

			assert.isInstanceOf(reporter.beforeAll(), Promise);
			assert.isInstanceOf(reporter.afterAll(), Promise);
			assert.isInstanceOf(reporter.begin(), Promise);
			assert.isInstanceOf(reporter.results(), Promise);
			assert.isInstanceOf(reporter.log.debug(), Promise);
			assert.isInstanceOf(reporter.log.error(), Promise);
			assert.isInstanceOf(reporter.log.info(), Promise);
		});

		it('wrapped function passes its argument to inner function', () => {
			const reporter = buildReporter(methods);
			const args = ['payload', {}];
			for (const method of ['beforeAll', 'afterAll', 'begin', 'results']) {
				reporter[method](...args);
				assert.calledWith(methods[method], ...args);
			}

			for (const method of ['debug', 'error', 'info']) {
				reporter.log[method](...args);
				assert.calledWith(methods[method], ...args);
			}
		});

		it('methods returning truthy values will be logged to console', async () => {
			const reporter = buildReporter(methods);
			methods.begin.returns('__MOCK__');
			methods.results.returns(false);

			await reporter.begin();
			assert.calledWith(console.log, '__MOCK__');

			console.log.resetHistory();

			await reporter.results();
			assert.notCalled(console.log);

		});
	});

});
