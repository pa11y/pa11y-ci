'use strict';

const defaults = require('lodash/defaultsDeep');
const pa11y = require('pa11y');
const queue = require('async/queue');

const noop = () => {};

module.exports = pa11yCi;
module.exports.defaults = {
	concurrency: 2,
	log: {
		error: noop,
		info: noop
	}
};

function pa11yCi(urls, options) {
	return new Promise(resolve => {
		options = defaults({}, options, module.exports.defaults);
		const log = options.log;
		delete options.log;
		const pa11yTest = pa11y(options);
		const taskQueue = queue(testRunner, options.concurrency);
		taskQueue.drain = testRunComplete;

		log.info(`Running Pa11y on ${urls.length} URLs:`);
		taskQueue.push(urls);

		const report = {
			total: urls.length,
			passes: 0,
			results: {}
		};

		function testRunner(config, done) {
			const url = (typeof config === 'string' ? config : config.url);
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
			resolve(report);
		}

	});
}

function filterNonErrors(result) {
	return result.type === 'error';
}
