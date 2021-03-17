'use strict';

const buildReporter = require('pa11y/lib/reporter');
const path = require('path');
const fs = require('fs');

function resolveReporters(reporters) {
	return [].concat(reporters).map(reporter => {
		if (typeof reporter !== 'string') {
			return undefined;
		}
		try {
			return require(reporter);
		} catch (_) {
			const localModule = path.isAbsolute(reporter) ?
				reporter : path.resolve(process.cwd(), reporter);
			if (fs.existsSync(localModule)) {
				return require(localModule);
			}
			console.error(`Unable to locale reporter "${reporter}"`);
			return undefined;
		}
	}).filter(Boolean).map(reporterModule => {
		const reporter = buildReporter(reporterModule);
		reporter.beforeAll = reporterModule.beforeAll;
		reporter.afterAll = reporterModule.afterAll;
		// Override results method, we need more than one input argument
		if (typeof reporterModule.results === 'function') {
			reporter.results = async (...args) => {
				const output = await reporterModule.results(...args);
				if (output) {
					console.log(output);
				}
			};
		}


		return reporter;
	});
}


module.exports = {
	resolveReporters
};
