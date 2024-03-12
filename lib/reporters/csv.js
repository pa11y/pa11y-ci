'use strict';

const fs = require('fs');
const {resolve, isAbsolute, dirname} = require('path');

function writeReport(fileName, data) {
	try {
		const dirPath = dirname(fileName);
		if (!(fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory())) {
			fs.mkdirSync(dirPath, {recursive: true});
		}
		fs.writeFileSync(fileName, data);
	} catch (error) {
		console.error(`Unable to write ${fileName}`);
		console.error(error);
	}
}

function resolveFile(fileName) {
	if (typeof fileName !== 'string') {
		return null;
	}
	return isAbsolute(fileName) ? fileName : resolve(process.cwd(), fileName);
}

function stringify(value) {
	if (typeof value === 'undefined' || value === null || value === '') {
		return '';
	}

	const str = String(value);
	return needsQuote(str) ? quoteField(str) : str;
}

function quoteField(field) {
	return `"${field.replace(/"/g, '""')}"`;
}

function needsQuote(str) {
	return str.includes(',') || str.includes('\r') || str.includes('\n') || str.includes('"');
}

module.exports = function csvReporter(options = {}) {
	const fileName = resolveFile(options.fileName);
	return {
		afterAll(report) {
			let csvString = 'url,code,type,typeCode,message,context,selector,runner\n';
			const results = report.results;
			for (const url in results) {
				if (Object.prototype.hasOwnProperty.call(results, url)) {
					const urlErrors = report.results[url];
					for (const errorRow of urlErrors) {
						const typeCode = errorRow.typeCode;
						const message = stringify(errorRow.message);
						const context = stringify(errorRow.context);
						const selector = stringify(errorRow.selector);
						csvString += `${url},${errorRow.code},${errorRow.type},${typeCode},` +
							`${message},${context},` +
							`${selector},${errorRow.runner}\n`;
					}
				}
			}

			// If reporter options specify an output file, write to file.
			// Otherwise, write to console for backwards compatibility with
			// previous --csv CLI option.
			if (fileName) {
				writeReport(fileName, csvString);
			} else {
				console.log(csvString);
			}
		}
	};
};
