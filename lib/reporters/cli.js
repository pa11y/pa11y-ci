'use strict';

const {cyan, green, grey, red, underline} = require('kleur');
const wordwrap = require('wordwrap');
const defaults = require('lodash/defaults');
const defaultCfg = require('../helpers/defaults');

module.exports = function cliReporter(options = {}, config = {}) {

	// Cleanup default logs
	// required to ensure the correct priority for log configuration
	// 1. programmatically or config file
	// 2. reporter options
	// 3. default
	const configLog = Object.assign({}, config.log);
	if (configLog.info === defaultCfg.log.info) {
		delete configLog.info;
	}
	if (configLog.error === defaultCfg.log.error) {
		delete configLog.error;
	}

	const log = defaults({}, configLog, options.log, defaultCfg.log);
	const wrapWidth = options.wrapWidth || config.wrapWidth || defaultCfg.wrapWidth;

	return {
		beforeAll(urls) {
			log.info(cyan(underline(`Running Pa11y on ${urls.length} URLs:`)));
		},

		results(testResults, reportConfig) {
			const withinThreshold = reportConfig.threshold ?
				testResults.issues.length <= reportConfig.threshold :
				false;

			let message = ` ${cyan('>')} ${testResults.pageUrl} - `;
			if (testResults.issues.length && !withinThreshold) {
				message += red(`${testResults.issues.length} errors`);
				log.error(message);
			} else {
				message += green(`${testResults.issues.length} errors`);
				if (withinThreshold) {
					message += green(
						` (within threshold of ${reportConfig.threshold})`
					);
				}
				log.info(message);
			}
		},

		error(error, url) {
			log.error(` ${cyan('>')} ${url} - ${red('Failed to run')}`);
		},

		afterAll(report) {
			const passRatio = `${report.passes}/${report.total} URLs passed`;

			if (report.passes === report.total) {
				log.info(green(`\n✔ ${passRatio}`));
			} else {
				// Now we loop over the errors and output them with
				// word wrapping
				const wrap = wordwrap(3, wrapWidth);
				Object.keys(report.results).forEach(url => {
					if (report.results[url].length) {
						log.error(underline(`\nErrors in ${url}:`));
						report.results[url].forEach(result => {
							const redBullet = red('•');
							if (result instanceof Error) {
								log.error(`\n ${redBullet} Error: ${wrap(result.message).trim()}`);
							} else {
								const context = result.context ?
									result.context.replace(/\s+/g, ' ') :
									'[no context]';
								log.error([
									'',
									` ${redBullet} ${wrap(result.message).trim()}`,
									'',
									grey(wrap(`(${result.selector})`)),
									'',
									grey(wrap(context))
								].join('\n'));
							}
						});
					}
				});
				log.error(red(`\n✘ ${passRatio}`));
			}
		}
	};
};
