'use strict';

const sinon = require('sinon');

const puppeteer = {
	launch: sinon.stub()
};

module.exports = puppeteer;

const mockBrowser = {
	close: sinon.stub(),
	createBrowserContext: sinon.spy(() => {
		return {close: mockBrowser.createBrowserContext.close};
	})
};

puppeteer.mockBrowser = mockBrowser;

mockBrowser.createBrowserContext.close = sinon.stub();

puppeteer.launch.resolves(mockBrowser);
