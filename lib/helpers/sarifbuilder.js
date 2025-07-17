/* eslint-disable max-len */
/* eslint-disable guard-for-in */
/* eslint-disable max-depth */
'use strict';

module.exports = function sarifBuilder(report) {


	const generateSarif = (uri, code, message, context, selector) => {
		const sarif = {
			version: '2.1.0',
			$schema:
				'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
			runs: [
				{
					tool: {
						driver: {
							name: 'pa11y',
							informationUri: 'https://github.com/pa11y/pa11y-ci',
							rules: [
								{
									id: `${code}`,
									shortDescription: {
										text: `${message}`
									}
								}
							]
						}
					},
					results: [
						{
							ruleId: `${code}`,
							message: {
								text: `${message}`
							},
							locations: [
								{
									physicalLocation: {
										artifactLocation: {
											uri: `${uri}`
										}
									},
									logicalLocations: [
										{
											fullselector: `${selector}`,
											uri: `${uri}`
										}
									]
								}
							],
							properties: {
								context: `${context}`
							}
						}
					]
				}
			]
		};
		return sarif;
	};
	// Console.log(`this is a report test ${report}`);
	// // Console.log(report.results[0].code);


	for (const [url, issues] of Object.entries(report.results)) {
		console.log(url);
		for (const issue of issues) {
			console.log(issue);
			console.log(issue.code);

			(generateSarif(url, issue.code, issue.message, issue.context, issue.context, issue.selector, issue.runner));


		}


	}
};


// 	For (const results of Object.entries(results)) {
// 		for (const {issue} in results) {
// 			if (Object.prototype.hasOwnProperty.call(issue)) {
// 				console.log(issue);
// 			}
// 		}
// 	}
// }
