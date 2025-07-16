'use strict';


// Const fs = require('fs');
// const {resolve, isAbsolute, dirname} = require('path');

function sarifBuilder(report) {
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


// 	Console.log(report);
// 	console.log(report.results);
// }

// Function writeReport(fileName, data) {
// 	try {
// 		const dirPath = dirname(fileName);
// 		if (!(fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory())) {
// 			fs.mkdirSync(dirPath, {recursive: true});
// 		}
// 		fs.writeFileSync(fileName, data);
// 	} catch (error) {
// 		console.error(`Unable to write ${fileName}`);
// 		console.error(error);
// 	}
// }

// function resolveFile(fileName) {
// 	if (typeof fileName !== 'string') {
// 		return null;
// 	}
// 	return isAbsolute(fileName) ? fileName : resolve(process.cwd(), fileName);
// }

module.exports = function sarifReporter() {
	// Const fileName = resolveFile(options.fileName);
	return {
		afterAll(report) {
			const obj = report;
			console.log(obj);
			console.log(obj.ỳ);
			// eslint-disable-next-line guard-for-in


		}};
};
// 	Const sarifString = JSON.stringify(report, sarif => {
// 		if (value instanceof Error) {
// 			return {message: value.message};
// 		}
// 		return value;


// If reporter options specify an output file, write to file.
// Otherwise, write to console for backwards compatibility with
// previous --json CLI option.
