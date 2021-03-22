'use strict';

/**
 * Build a Pa11y reporter.
 *
 * Same as 'pa11y/lib/reporter' but reporter methods accept multiple arguments
 * @private
 * @param {Object} methods - The reporter methods.
 * @returns {Object} Returns pa11y reporter.
 */
module.exports = function buildReporter(methods) {
	const reporter = {
		report: new Map(),
		supports: methods.supports,
		beforeAll: buildReporterMethod(methods.beforeAll),
		afterAll: buildReporterMethod(methods.afterAll),
		begin: buildReporterMethod(methods.begin),
		results: buildReporterMethod(methods.results),
		log: {
			debug: buildReporterMethod(methods.debug),
			error: buildReporterMethod(methods.error, 'error'),
			info: buildReporterMethod(methods.info)
		}
	};

	return reporter;
};

/**
 * Build a Pa11y reporter method, making it async and only outputting when
 * actual output is returned.
 * @private
 * @param {Function} method - The reporter method to build.
 * @param {String} [consoleMethod='log'] - The console method to use in reporting.
 * @returns {Function} Returns a built async reporter method.
 */
function buildReporterMethod(method, consoleMethod = 'log') {
	if (typeof method !== 'function') {
		return false;
	}
	return async (...args) => {
		const output = await method(...args);
		if (output) {
			console[consoleMethod](output);
		}
	};
}
