'use strict';

const fs = require('fs');

module.exports = function jsonReporter(options = {}) {
	return {
		afterAll(report) {
			const jsonString = JSON.stringify(report, (key, value) => {
				if (value instanceof Error) {
					return {message: value.message};
				}
				return value;
			});

            // If reporter options specify an output file, write to file.
            // Otherwise, write to console for backwards compatibility with
            // previous --json CLI option.
			if (options.fileName) {
				fs.writeFileSync(options.fileName, jsonString);
			} else {
				console.log(jsonString);
			}
		}
	};
};
