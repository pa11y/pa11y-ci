'use strict';

const noop = () => undefined;

module.exports = {
	concurrency: 2,
	log: {
		error: noop,
		info: noop
	},
	wrapWidth: 80,
	reporters: ['cli'],
	useIncognitoBrowserContext: false
};
