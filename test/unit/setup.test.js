'use strict';

const assert = require('proclaim');
const quibble = require('quibble');
const sinon = require('sinon');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

afterEach(() => {
	quibble.reset();
});
