'use strict';

const path = require('path');
const fs = require('fs');
const buildReporter = require('./reporter');

module.exports = function resolveReporters(reporters) {
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
			console.error(`Unable to load reporter "${reporter}"`);
			return undefined;
		}
	}).filter(Boolean).map(reporterModule => {
		return buildReporter(reporterModule);
	});
};
