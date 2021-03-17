'use strict';

const sinon = require('sinon');

module.exports = () => ({
	beforeAll: sinon.spy(),
	begin: sinon.spy(),
	results: sinon.spy(),
	afterAll: sinon.spy()
});
