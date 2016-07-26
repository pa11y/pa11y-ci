#!/usr/bin/env node

//
// This is the entry-point for the command line test
// runner. This uses the function defined in the
// `lib/pa11y-ci.js` file and passes in command line
// options.
//
'use strict';

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const pa11yCi = require('..');
const path = require('path');
const pkg = require('../package.json');
const program = require('commander');

// Here we're using Commander to specify the CLI options
program
	.version(pkg.version)
	.usage('[options]')
	.option(
		'-c, --config <path>',
		'the path to a JSON or JavaScript config file'
	)
	.option(
		'-s, --sitemap <url>',
		'the path to a sitemap'
	)
	.option(
		'-f, --sitemap-find <pattern>',
		'a pattern to find in sitemaps. Use with --sitemap-replace'
	)
	.option(
		'-r, --sitemap-replace <string>',
		'a replacement to apply in sitemaps. Use with --sitemap-find'
	)
	.option(
		'-j, --json',
		'Output results as JSON'
	)
	.parse(process.argv);

// Start the promise chain to actually run everything
Promise.resolve()
	.then(() => {
		// Load config based on the `--config` flag
		return loadConfig(program.config);
	})
	.then(config => {
		// Load a sitemap based on the `--sitemap` flag
		if (program.sitemap) {
			return loadSitemapIntoConfig(program, config);
		}
		return config;
	})
	.then(config => {
		// Actually run Pa11y CI
		return pa11yCi(config.urls, config.defaults);
	})
	.then(report => {
		// Output JSON if asked for it
		if (program.json) {
			console.log(JSON.stringify(report, (key, value) => {
				if (value instanceof Error) {
					return {
						message: value.message
					};
				}
				return value;
			}));
		}
		// Decide on an exit code based on whether
		// everything passes
		if (report.passes < report.total) {
			process.exit(2);
		} else {
			process.exit(0);
		}
	})
	.catch(error => {
		// Handle any errors
		console.error(error.message);
		process.exit(1);
	});

// This function loads the JSON or JavaScript config
// file specified by the user. It checks for config
// files in the following order:
//   - no extension (JSON)
//   - js extension (JavaScript)
//   - json extension (JSON)
function loadConfig(configPath) {
	return new Promise((resolve, reject) => {
		configPath = resolveConfigPath(configPath);
		let config = loadLocalConfigUnmodified(configPath);
		if (!config) {
			config = loadLocalConfigWithJs(configPath);
		}
		if (!config) {
			config = loadLocalConfigWithJson(configPath);
		}
		if (program.config && !config) {
			return reject(new Error(`The config file "${configPath}" could not be loaded`));
		}
		resolve(defaultConfig(config || {}));
	});
}

// Resolve the config path, and make sure it's
// relative to the current working directory
function resolveConfigPath(configPath) {
	// Specify a default
	configPath = configPath || '.pa11yci';
	if (configPath[0] !== '/') {
		configPath = path.join(process.cwd(), configPath);
	}
	return configPath;
}

// Load the config file using the exact path that
// was passed in
function loadLocalConfigUnmodified(configPath) {
	try {
		return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	} catch (error) {}
}

// Load the config file but adding a .js extension
function loadLocalConfigWithJs(configPath) {
	try {
		return require(`${configPath}.js`);
	} catch (error) {}
}

// Load the config file but adding a .json extension
function loadLocalConfigWithJson(configPath) {
	try {
		return require(`${configPath}.json`);
	} catch (error) {}
}

// Tidy up and default the configurations found in
// the file the user specified.
function defaultConfig(config) {
	config.urls = config.urls || [];
	config.defaults = config.defaults || {};
	config.defaults.log = config.defaults.log || console;
	config.defaults.wrapWidth = process.stdout.columns;
	if (program.json) {
		delete config.defaults.log;
	}
	return config;
}

// Load a sitemap from a remote URL, parse out the
// URLs, and add them to an existing config object
function loadSitemapIntoConfig(program, config) {
	const sitemapUrl = program.sitemap;
	const sitemapFind = (program.sitemapFind ? new RegExp(program.sitemapFind, 'gi') : null);
	const sitemapReplace = program.sitemapReplace || '';

	return Promise.resolve()
		.then(() => {
			return fetch(sitemapUrl);
		})
		.then(response => {
			return response.text();
		})
		.then(body => {
			const $ = cheerio.load(body, {
				xmlMode: true
			});
			config.urls = $('url > loc').toArray().map(element => {
				let url = $(element).text();
				if (sitemapFind) {
					url = url.replace(sitemapFind, sitemapReplace);
				}
				return url;
			});
			return config;
		})
		.catch(error => {
			if (error.stack && error.stack.includes('node-fetch')) {
				throw new Error(`The sitemap "${sitemapUrl}" could not be loaded`);
			}
			throw new Error(`The sitemap "${sitemapUrl}" could not be parsed`);
		});
}
