/* eslint max-len: 'off' */
'use strict';

module.exports = function sarifBuilder(report) {
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
						rules: []
					}
				},
				results: []
			}
		]
	};

	const seenRules = new Set();

	for (const [url, issues] of Object.entries(report.results)) {
		for (const issue of issues) {
			const {code, message, selector, context, runner} = issue;

			if (!seenRules.has(code)) {
				sarif.runs[0].tool.driver.rules.push({
					id: code,
					shortDescription: {text: message}
				});
				seenRules.add(code);
			}

			sarif.runs[0].results.push({
				ruleId: code,
				level: 'error',
				message: {text: message},
				locations: [
					{
						physicalLocation: {
							artifactLocation: {uri: url}
						},
						logicalLocations: [
							{
								fullyQualifiedName: selector
							}
						]
					}
				],
				properties: {
					context,
					runner
				}
			});
		}
	}

	return sarif;
};
