/**
 * config.js
 *
 * The top level configuration loader
 *
 * @author Nick Swenson
 */

/**
 * Module dependencies
 */
var extend = require('extend')
  , util = require('../libs/util')('config');

/**
 * Configs
 */
var config = (function () {
	if (!process.env.NODE_ENV) {
		util.log(' NO ENVIRONMENT PROVIDED; DEFAULTING TO DEVELOPMENT ')
		process.env.NODE_ENV = 'development';
	}
    switch (process.env.NODE_ENV) {
        case 'development':
            return extend(true, require('./config.js'), require('./config_dev.json'));

        case 'test':
            return extend(true, require('./config.js'), require('./config_test.json'));

        default:
            return util.log(' ---- ERROR LOADING CONFIG FILE! ---- ');
    }
})()

module.exports = (function () {
    Error.stackTraceLimit = 20;
    if (process.env.HOST) config.app.host = process.env.HOST;

    return config;
})()
