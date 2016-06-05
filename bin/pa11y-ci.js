#!/usr/bin/env node
'use strict';

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const pa11yCi = require('..');
const path = require('path');
const pkg = require('../package.json');
const program = require('commander');

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
	.parse(process.argv);

Promise.resolve()
	.then(() => {
		return loadConfig(program.config);
	})
	.then(config => {
		if (program.sitemap) {
			return loadSitemapIntoConfig(program.sitemap, config);
		}
		return config;
	})
	.then(config => {
		return pa11yCi(config.urls, config.defaults);
	})
	.then(report => {
		if (report.passes < report.total) {
			process.exit(2);
		} else {
			process.exit(0);
		}
	})
	.catch(error => {
		console.error(error.message);
		process.exit(1);
	});

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

function resolveConfigPath(configPath) {
	configPath = configPath || '.pa11yci';
	if (configPath[0] !== '/') {
		configPath = path.join(process.cwd(), configPath);
	}
	return configPath;
}

function loadLocalConfigUnmodified(configPath) {
	try {
		return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	} catch (error) {}
}

function loadLocalConfigWithJs(configPath) {
	try {
		return require(`${configPath}.js`);
	} catch (error) {}
}

function loadLocalConfigWithJson(configPath) {
	try {
		return require(`${configPath}.json`);
	} catch (error) {}
}

function defaultConfig(config) {
	config.urls = config.urls || [];
	config.defaults = config.defaults || {};
	config.defaults.log = config.defaults.log || console;
	return config;
}

function loadSitemapIntoConfig(sitemapUrl, config) {
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
				return $(element).text();
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
