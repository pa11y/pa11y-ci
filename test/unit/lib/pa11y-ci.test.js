/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/pa11y-ci', () => {
	let defaults;
	let log;
	let pa11y;
	let pa11yCi;
	let queue;
	let puppeteer;

	beforeEach(() => {
		defaults = sinon.spy(require('lodash/defaultsDeep'));
		mockery.registerMock('lodash/defaultsDeep', defaults);

		log = require('../mock/log.mock');

		pa11y = require('../mock/pa11y.mock');
		mockery.registerMock('pa11y', pa11y);

		queue = sinon.spy(require('async/queue'));
		mockery.registerMock('async/queue', queue);

		puppeteer = require('../mock/puppeteer.mock');
		mockery.registerMock('puppeteer', puppeteer);

		pa11yCi = require('../../..');
	});

	it('exports a function', () => {
		assert.isFunction(pa11yCi);
	});

	it('has a `defaults` property', () => {
		assert.isObject(pa11yCi.defaults);
	});

	describe('.defaults', () => {
		beforeEach(() => {
			defaults = pa11yCi.defaults;
		});

		it('has a `concurrency` property', () => {
			assert.strictEqual(defaults.concurrency, 1);
		});

		it('has a `log` property', () => {
			assert.isObject(defaults.log);
		});

		it('has a `log.error` method', () => {
			assert.isFunction(defaults.log.error);
		});

		it('has a `log.info` method', () => {
			assert.isFunction(defaults.log.info);
		});

		it('has a `wrapWidth` property', () => {
			assert.strictEqual(defaults.wrapWidth, 80);
		});

		it('has a `useIncognitoBrowserContext` property', () => {
			assert.strictEqual(defaults.useIncognitoBrowserContext, true);
		});

		it('has a cli reporter', () => {
			assert.isArray(defaults.reporters);
			assert.match(defaults.reporters[0], 'cli');
		});
	});

	describe('pa11yCi(urls, options)', () => {
		let pa11yError;
		let pa11yResults;
		let returnedPromise;
		let userUrls;
		let userOptions;

		beforeEach(() => {
			userUrls = [
				'foo-url',
				'bar-url',
				'baz-url'
			];
			userOptions = {
				concurrency: 4,
				log
			};

			pa11yError = new Error('Pa11y Error');
			pa11yResults = {
				pageUrl: 'bar-url',
				issues: [
					{
						type: 'error',
						message: 'Pa11y Result Error',
						selector: '',
						context: null
					}
				]
			};

			pa11y.withArgs('foo-url').resolves({pageUrl: 'foo-url',
				issues: []});
			pa11y.withArgs('bar-url').resolves(pa11yResults);
			pa11y.withArgs('baz-url').rejects(pa11yError);

			returnedPromise = pa11yCi(userUrls, userOptions);
		});

		it('returns a promise', () => {
			assert.instanceOf(returnedPromise, Promise);
		});

		describe('.then()', () => {
			let report;

			beforeEach(done => {
				returnedPromise.then(value => {
					report = value;
					done();
				}).catch(done);
			});

			it('defaults the options using `pa11yCi.defaults`', () => {
				assert.isObject(defaults.firstCall.args[0]);
				assert.strictEqual(defaults.firstCall.args[1], userOptions);
				assert.strictEqual(defaults.firstCall.args[2], pa11yCi.defaults);
			});

			it('deletes the `log` and `reporters` option', () => {
				const firstCallOptions = pa11y.getCall(0).args[1];
				assert.doesNotInclude(firstCallOptions, 'log');
				assert.doesNotInclude(firstCallOptions, 'reporters');
			});

			it('creates an Async.js queue with the expected concurrency', () => {
				assert.calledOnce(queue);
				assert.isFunction(queue.firstCall.args[0]);
				assert.strictEqual(queue.firstCall.args[1], userOptions.concurrency);
			});

			it('assigns a drain callback to the Async queue', () => {
				assert.isFunction(queue.firstCall.returnValue.drain);
			});

			it('Runs the Pa11y test runner on each of the URLs', () => {
				assert.callCount(pa11y, 3);
				assert.calledWith(pa11y, 'foo-url');
				assert.calledWith(pa11y, 'bar-url');
				assert.calledWith(pa11y, 'baz-url');
			});

			it('logs that the tests have started running', () => {
				assert.calledWithMatch(log.info, /3 URLs/i);
			});

			it('logs the number of errors for each URL, or if they fail to run', () => {
				assert.calledWithMatch(log.info, /foo-url.*0 errors/i);
				assert.calledWithMatch(log.error, /bar-url.*1 errors/i);
				assert.calledWithMatch(log.error, /baz-url.*failed to run/i);
			});

			it('logs the pass/fail ratio', () => {
				assert.calledWithMatch(log.error, /1\/3 urls passed/i);
			});

			it('logs the errors for each URL that has some', () => {
				assert.neverCalledWithMatch(log.error, /errors in foo-url/i);
				assert.calledWithMatch(log.error, /errors in bar-url/i);
				assert.calledWithMatch(log.error, /pa11y error/i);
				assert.calledWithMatch(log.error, /pa11y result error/i);
				assert.neverCalledWithMatch(log.error, /pa11y result warning/i);
			});

			it('resolves with an object', () => {
				assert.isObject(report);
			});

			describe('resolved object', () => {

				it('has a `total` property set to the total number of URLs processed', () => {
					assert.strictEqual(report.total, userUrls.length);
				});

				it('has a `passes` property set to the total number of URLs that passed the test', () => {
					assert.strictEqual(report.passes, 1);
				});

				it('has a `results` property set to an object where keys are URLs and values are their results', () => {
					assert.isObject(report.results);

					assert.isArray(report.results['foo-url']);
					assert.lengthEquals(report.results['foo-url'], 0);

					assert.isArray(report.results['bar-url']);
					assert.lengthEquals(report.results['bar-url'], 1);
					assert.strictEqual(report.results['bar-url'][0], pa11yResults.issues[0]);

					assert.isArray(report.results['baz-url']);
					assert.lengthEquals(report.results['baz-url'], 1);
					assert.strictEqual(report.results['baz-url'][0], pa11yError);
				});

			});

		});

		describe('when all URLs pass the test', () => {

			beforeEach(() => {

				log.error = sinon.spy();
				log.info = sinon.spy();

				function fakeResolve(pageUrl) {
					return Promise.resolve({pageUrl,
						issues: []});
				}

				pa11y.reset();
				pa11y.withArgs('foo-url').callsFake(fakeResolve);
				pa11y.withArgs('bar-url').callsFake(fakeResolve);
				pa11y.withArgs('baz-url').callsFake(fakeResolve);

				returnedPromise = pa11yCi(userUrls, userOptions);
			});

			describe('.then()', () => {

				beforeEach(done => {
					returnedPromise.then(() => {
						done();
					}).catch(done);
				});

				it('logs zero errors for each URL', () => {
					assert.calledWithMatch(log.info, /foo-url.*0 errors/i);
					assert.calledWithMatch(log.info, /bar-url.*0 errors/i);
					assert.calledWithMatch(log.info, /baz-url.*0 errors/i);
				});

				it('logs the pass/fail ratio', () => {
					assert.calledWithMatch(log.info, /3\/3 urls passed/i);
				});

				it('never logs any errors', () => {
					assert.notCalled(log.error);
				});

			});

		});


	});

	describe('when URLs include additional configurations', () => {

		let mockBrowser;
		let userUrls;
		let returnedPromise;
		let userOptions;

		beforeEach(async () => {

			log.error = sinon.spy();
			log.info = sinon.spy();
			userOptions = {
				concurrency: 4,
				log
			};

			mockBrowser = await puppeteer.launch();

			userUrls = [
				{
					url: 'qux-url',
					bar: 'baz',
					threshold: 2,
					concurrency: 4,
					wrapWidth: 80,
					browser: mockBrowser,
					useIncognitoBrowserContext: false
				}
			];

			pa11y.reset();
			pa11y.withArgs('qux-url', userUrls[0]).resolves({
				pageUrl: 'qux-url',
				issues: [
					{
						type: 'error',
						message: 'Pa11y Result Error',
						selector: '',
						context: null
					}
				]});

			returnedPromise = pa11yCi(userUrls, userOptions);
		});

		describe('.then()', () => {
			let report;

			beforeEach(done => {
				returnedPromise.then(value => {
					report = value;
					done();
				}).catch(done);
			});

			it('Runs the Pa11y test runner on each of the URLs with configurations', () => {
				assert.callCount(pa11y, 1);
				assert.calledWith(pa11y, 'qux-url', userUrls[0]);
			});
			it('did not createBrowserContext', () => {
				assert.callCount(mockBrowser.createBrowserContext, 0);
			});
			it('closes the browser context after the test runner completes', () => {
				assert.callCount(mockBrowser.close, 1);
			});

			it('correctly logs the number of errors for the URL', () => {
				assert.calledWithMatch(log.info, /qux-url.*1 errors/i);
			});

			describe('resolved object', () => {

				it('has a `results` property set to an object where keys are URLs and values are their results', () => {
					assert.isObject(report.results);
					assert.strictEqual(report.passes, 1);
					assert.isArray(report.results['qux-url']);
					assert.lengthEquals(report.results['qux-url'], 0);
				});

			});

		});

	});


	describe('when options specify useIncognitoBrowserContext: true', () => {
		let mockBrowser;
		let userUrls;
		let returnedPromise;
		let userOptions;

		beforeEach(async () => {
			log.error = sinon.spy();
			log.info = sinon.spy();
			userOptions = {
				concurrency: 4,
				log,
				useIncognitoBrowserContext: true
			};

			mockBrowser = await puppeteer.launch();

			userUrls = [
				{
					url: 'qux-url-1',
					bar: 'baz',
					threshold: 2,
					concurrency: 4,
					wrapWidth: 80,
					browser: mockBrowser,
					useIncognitoBrowserContext: true
				},
				{
					url: 'qux-url-2',
					bar: 'baz',
					threshold: 2,
					concurrency: 4,
					wrapWidth: 80,
					browser: mockBrowser,
					useIncognitoBrowserContext: true
				}
			];

			pa11y.reset();
			returnedPromise = pa11yCi(userUrls, userOptions);
		});

		describe('.then()', () => {

			beforeEach(done => {
				returnedPromise
					.then(() => done())
					.catch(done);
			});

			it('closes each incognito browser context created during test runner execution', () => {
				assert.callCount(
					mockBrowser.createBrowserContext,
					2
				);
				assert.callCount(
					mockBrowser.createBrowserContext.close,
					2
				);
			});

			it('closes the browser context after the test runner completes', () => {
				assert.callCount(mockBrowser.close, 1);
			});
		});
	});

	describe('reporters', () => {
		let pa11yResults;
		let returnedPromise;
		let userUrls;
		let userOptions;
		let reporter;
		let report;

		beforeEach(done => {
			reporter = require('../mock/reporter.mock')();
			mockery.registerMock('my-pa11y-reporter', reporter);

			userUrls = [
				'foo-url',
				'bar-url',
				'baz-url'
			];
			userOptions = {
				concurrency: 4,
				log,
				reporters: ['my-pa11y-reporter']
			};

			pa11yResults = {
				pageUrl: 'bar-url',
				issues: [
					{
						type: 'error',
						message: 'Pa11y Result Error',
						selector: '',
						context: null
					}
				]
			};

			pa11y.withArgs('foo-url').resolves({pageUrl: 'foo-url',
				issues: []});
			pa11y.withArgs('bar-url').resolves(pa11yResults);
			pa11y.withArgs('baz-url').resolves({pageUrl: 'baz-url',
				issues: []});

			returnedPromise = pa11yCi(userUrls, userOptions);

			returnedPromise.then(value => {
				report = value;
				done();
			}).catch(done);
		});


		it('calls the beforeAll method once', () => {
			assert.calledWithMatch(reporter.beforeAll, userUrls);
			assert.callCount(reporter.beforeAll, 1);
		});
		it('calls the afterAll method once', () => {
			assert.calledWithMatch(reporter.afterAll, report, sinon.match.object);
			assert.callCount(reporter.afterAll, 1);
		});

		it('calls the begin method for each URL', () => {
			userUrls.forEach((url, i) => {
				reporter.begin.getCall(i).calledWith(url);
			});
			assert.callCount(reporter.begin, userUrls.length);
		});

		it('calls the results method for each URL', () => {
			userUrls.forEach((url, i) => {
				const spyCall = reporter.results.getCall(i);
				assert.calledWithMatch(
					spyCall,
					sinon.match({pageUrl: url,
						issues: report.results[url]}),
					sinon.match.object
				);
			});
			assert.callCount(reporter.results, userUrls.length);
		});

	});

	describe('multiple reporters', () => {
		let userUrls;
		let userOptions;
		let optionReporter;
		let reporter;

		beforeEach(async () => {
			reporter = require('../mock/reporter.mock')();
			optionReporter = require('../mock/reporter-options.mock');
			mockery.registerMock('my-reporter', reporter);
			mockery.registerMock('option-reporter', optionReporter);

			userUrls = [
				'foo-url'
			];
			userOptions = {
				concurrency: 4,
				log,
				reporters: ['my-reporter', ['option-reporter', {fileName: '/__TEST__.json'}], 'option-reporter']
			};

			pa11y.withArgs('foo-url').resolves({pageUrl: 'foo-url',
				issues: []});

			await pa11yCi(userUrls, userOptions);
		});

		it('calls reporters results methods', () => {
			assert.calledOnce(reporter.results);
			assert.callCount(optionReporter.$$resultsStub, 2);
		});

		it('calls option-reporter results with the correct options', () => {
			// First time: custom option
			const firstCall = optionReporter.$$resultsStub.getCall(0);
			assert.calledWith(firstCall, 'foo-url', '/__TEST__.json');

			// First time: default option
			const secondCall = optionReporter.$$resultsStub.getCall(1);
			assert.calledWith(secondCall, 'foo-url', '');
		});
	});
});
