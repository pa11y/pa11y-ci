//
// This is the main library code for Pa11y CI. It's
// in charge of taking some URLs and configuration,
// then managing a queue of Pa11y jobs.
//
'use strict';

const defaults = require('lodash/defaultsDeep');
const pa11y = require('pa11y');
const queue = require('async/queue');

// Just an empty function to use as default
// configuration and arguments
const noop = () => {};

// Here's the exports. `pa11yCi` is defined further down the
// file and is the function that actually starts to do things
module.exports = pa11yCi;

// The default configuration object. This is extended with
// whatever configurations the user passes in from the
// command line
module.exports.defaults = {
	concurrency: 2,
	log: {
		error: noop,
		info: noop
	}
};

// This function does all the setup and actually runs Pa11y
// against the passed in URLs. It accepts options in the form
// of an object and returns a Promise
function pa11yCi(urls, options) {
	return new Promise(resolve => {

		// Default the passed in options
		options = defaults({}, options, module.exports.defaults);

		// We delete options.log because we don't want it to
		// get passed into Pa11y – we don't want super verbose
		// logs from it
		const log = options.log;
		delete options.log;

		// Create a Pa11y test function and an async queue
		const pa11yTest = pa11y(options);
		const taskQueue = queue(testRunner, options.concurrency);
		taskQueue.drain = testRunComplete;

		// Push the URLs on to the queue
		log.info(`Running Pa11y on ${urls.length} URLs:`);
		taskQueue.push(urls);

		// The report object is what we eventually return to
		// the user or command line runner
		const report = {
			total: urls.length,
			passes: 0,
			results: {}
		};

		// This is the actual test runner, which the queue will
		// execute on each of the URLs
		function testRunner(config, done) {
			const url = (typeof config === 'string' ? config : config.url);

			// Run the Pa11y test on the current URL and add
			// results to the report object
			pa11yTest.run(config, (error, results) => {
				if (error) {
					log.error(` > ${url} - Failed to run`);
					report.results[url] = [error];
					return done();
				}
				const errors = results.filter(filterNonErrors);
				const message = ` > ${url} - ${errors.length} errors`;
				if (errors.length) {
					log.error(message);
					report.results[url] = errors;
				} else {
					log.info(message);
					report.results[url] = [];
					report.passes += 1;
				}
				done();
			});
		}

		// This function is called once all of the URLs in the
		// queue have been tested. It outputs the actual errors
		// that occurred in the test as well as a pass/fail ratio
		function testRunComplete() {
			const passRatio = `${report.passes}/${report.total} URLs passed`;
			if (report.passes === report.total) {
				log.info(`\n✔ ${passRatio}`);
			} else {
				Object.keys(report.results).forEach(url => {
					if (report.results[url].length) {
						log.error(`\nErrors in ${url}:`);
						report.results[url].forEach(result => {
							if (result instanceof Error) {
								log.error(` • ${result.message}`);
							} else {
								log.error(` • ${result.message}\n   ${result.selector}\n   ${result.context}`);
							}
						});
					}
				});
				log.error(`\n✘ ${passRatio}`);
			}

			// Resolve the promise with the report
			resolve(report);
		}

	});
}

// Just a utility function to filter out non errors
function filterNonErrors(result) {
	return result.type === 'error';
}
