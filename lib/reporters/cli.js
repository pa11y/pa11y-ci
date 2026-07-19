'use strict';

const {styleText} = require('util');
const wordwrap = require('wordwrap');
const defaults = require('lodash/defaults');
const defaultCfg = require('../helpers/defaults');

function cleanConfigLog(log) {
	// Cleanup default logs
	// required to ensure the correct priority for log configuration
	// 1. programmatically or config file
	// 2. reporter options
	// 3. default

	const configLog = Object.assign({}, log);
	if (configLog.info === defaultCfg.log.info) {
		delete configLog.info;
	}
	if (configLog.error === defaultCfg.log.error) {
		delete configLog.error;
	}
	return configLog;
}

module.exports = function cliReporter(options = {}, config = {}) {

	const configLog = cleanConfigLog(config.log);
	const log = defaults({}, configLog, options.log, defaultCfg.log);
	const wrapWidth = options.wrapWidth || config.wrapWidth || defaultCfg.wrapWidth;

	return {
		beforeAll(urls) {
			log.info(styleText(['cyan', 'underline'], `Running Pa11y on ${urls.length} URLs:`));
		},

		results(testResults, reportConfig) {
			const withinThreshold = reportConfig.threshold ?
				testResults.issues.length <= reportConfig.threshold :
				false;

			let message = ` ${styleText('cyan', '>')} ${testResults.pageUrl} - `;
			if (testResults.issues.length && !withinThreshold) {
				message += styleText('red', `${testResults.issues.length} errors`);
				log.error(message);
			} else {
				message += styleText('green', `${testResults.issues.length} errors`);
				if (withinThreshold) {
					message += styleText('green',
						` (within threshold of ${reportConfig.threshold})`
					);
				}
				log.info(message);
			}
		},

		error(error, url) {
			log.error(` ${styleText('cyan', '>')} ${url} - ${styleText('red', 'Failed to run')}`);
		},

		afterAll(report) {
			const passRatio = `${report.passes}/${report.total} URLs passed`;

			if (report.passes === report.total) {
				log.info(styleText('green', `\n✔ ${passRatio}`));
			} else {
				// Now we loop over the errors and output them with
				// word wrapping
				const wrap = wordwrap(3, wrapWidth);
				Object.keys(report.results).forEach(url => {
					if (report.results[url].length) {
						log.error(styleText('underline', `\nErrors in ${url}:`));
						report.results[url].forEach(result => {
							const redBullet = styleText('red', '•');
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
									styleText('gray', wrap(`(${result.selector})`)),
									'',
									styleText('gray', wrap(context))
								].join('\n'));
							}
						});
					}
				});
				log.error(styleText('red', `\n✘ ${passRatio}`));
			}
		}
	};
};
