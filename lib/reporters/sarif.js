'use strict';


// Const fs = require('fs');
// const {resolve, isAbsolute, dirname} = require('path');

function sarifBuilder(report) {
	console.log(`this is a report test ${report}`);
	// console.log(report.results[0].code);
	console.log(report);
	const filler = 'weFillin';

	return {
		version: '2.1.0',
		$schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
		runs: [
			{
				tool: {
					driver: {
						name: 'pa11y',
						informationUri: 'https://github.com/pa11y/pa11y-ci',
						rules: [
							{
								id: `${filler}`,
								shortDescription: {
									text: `${filler}`
								}
							}
						]
					}
				},
				results: [
					{
						ruleId: `${filler}`,
						message: {
							text: `${filler}`
						},
						locations: [
							{
								physicalLocation: {
									artifactLocation: {
										uri: `${filler}`
									}
								},
								logicalLocations: [
									{
										fullselector: `${filler}`,
										uri: `${filler}`
									}
								]
							}
						],
						properties: {
							context: `${filler}`
						}
					}
				]
			}
		]
	};

}


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

module.exports = function sarifReporter(options = {}) {
	const fileName = resolveFile(options.fileName);
	return {
		afterAll(report) {
			const jsonString = JSON.stringify(sarifBuilder(report), (key, value) => {
				if (value instanceof Error) {
					return {message: value.message};
				}
				return value;
			});

			// If reporter options specify an output file, write to file.
			// Otherwise, write to console for backwards compatibility with
			// previous --json CLI option.
			if (fileName) {
				writeReport(fileName, jsonString);
			} else {
				console.log(jsonString);
			}
		}
	};
};


// If reporter options specify an output file, write to file.
// Otherwise, write to console for backwards compatibility with
// previous --json CLI option.
