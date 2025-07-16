'use strict';

module.exports = function sarifBuilder(report) {
	console.log(`this is a report test ${report}`);
	// Console.log(report.results[0].code);
	console.log(report);
	const filler = 'weFillin';

	return {
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
};
