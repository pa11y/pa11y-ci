/* eslint max-len: 'off' */
'use strict';

const path = require('path');
const {spawn} = require('child_process');
const startWebsite = require('./mock/website');

before(done => {
	startWebsite(8090, (error, server) => {
		if (!error) {
			global.server = server;
			global.cliCall = cliCall;
		}
		done(error);
	});
});

function cliCall(cliArguments = []) {

	const binFile = path.resolve(__dirname, '../../bin/pa11y-ci.js');
	const result = {
		output: '',
		stdout: '',
		stderr: '',
		code: 0
	};

	return new Promise((resolve, reject) => {
		const child = spawn('node', [binFile, ...cliArguments], {
			cwd: path.join(__dirname, 'mock/config'),
			env: process.env
		});
		let failed = false;
		const timer = setTimeout(() => {
			failed = true;
			child.kill('SIGKILL');
			reject(new Error([
				`CLI timed out after 15000ms: node ${JSON.stringify([binFile, ...cliArguments])}`,
				`stdout:\n${result.stdout}`,
				`stderr:\n${result.stderr}`
			].join('\n\n')));
		}, 15000);

		child.stdout.on('data', data => {
			result.stdout += data;
			result.output += data;
		});
		child.stderr.on('data', data => {
			result.stderr += data;
			result.output += data;
		});
		child.on('close', code => {
			clearTimeout(timer);
			if (failed) {
				return;
			}
			result.code = code;
			global.lastResult = result;
			resolve(result);
		});
		child.on('error', error => {
			clearTimeout(timer);
			failed = true;
			reject(error);
		});
	});

}
