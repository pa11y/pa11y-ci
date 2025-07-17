'use strict';

module.exports = function sarifBuilder(report) {

	const generateSarif = (uri, code, message, context, selector) => {
		const sarif = {
			version: "2.1.0",
			$schema:
				"https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json",
			runs: [
				{
					tool: {
						driver: {
							name: "pa11y",
							informationUri: "https://github.com/pa11y/pa11y-ci",
							rules: [
								{
									id: `${code}`,
									shortDescription: {
										text: `${message}`,
									},
								},
							],
						},
					},
					results: [
						{
							ruleId: `${code}`,
							message: {
								text: `${message}`,
							},
							locations: [
								{
									physicalLocation: {
										artifactLocation: {
											uri: `${uri}`,
										},
									},
									logicalLocations: [
										{
											fullyQualifiedName: `${selector}`,
											uri: `${uri}`,
										},
									],
								},
							],
							properties: {
								context: `${context}`,
							},
						},
					],
				},
			],
		};
		return sarif;
	};


	console.log(report);

	for (const [url, issues] of Object.entries(report.results)) {
		for (const issue of issues) {
			return (generateSarif(url,
				issue.code,
				issue.message,
				issue.context,
				issue.context,
				issue.selector,
				issue.runner));
		}
	}
};
