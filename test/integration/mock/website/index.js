'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const {URL} = require('url');

module.exports = startWebsite;

function startWebsite(port, done) {

	const server = http.createServer((request, response) => {

		const urlPath = new URL(request.url, 'http://localhost').pathname;
		const viewPath = path.join(__dirname, 'html', `${urlPath}.html`);

		if (urlPath.includes('.xml')) {
			// Stands in for a preview environment behind a bypass secret
			if (urlPath.includes('protected') && request.headers['x-test-secret'] !== 'let-me-in') {
				response.writeHead(403);
				return response.end('Forbidden');
			}
			response.writeHead(200, {
				'Content-Type': 'text/xml'
			});
			const file = urlPath.replace('-protected', '');
			return response.end(fs.readFileSync(path.join(__dirname, file), 'utf-8'));
		}

		try {
			const html = fs.readFileSync(viewPath, 'utf-8');
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.end(html);
		} catch {
			response.writeHead(404);
			response.end('Not found');
		}

	});

	server.listen(port, error => {
		done(error, server);
	});

}
