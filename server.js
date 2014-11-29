/**
 * server.js
 *
 * The server initializer for the simpleplus service
 *
 * @author Nick Swenson
 */

/**
 * Utility functions
 */
var util = require('./libs/util.js')('server')
  , initialize = require('./libs/initialize.js')
  , async = require('async');

/**
 * APPLICATION INITIALIZATION
 */
async.series([
	/** Initialize App */
	util.proxy(initialize.initApp, initialize),

	/** Initialize Server */
	util.proxy(initialize.initServer, initialize)

], function (err) {
	if (err) {
		console.error('Error while initializing: ', err);
		console.error('Suiciding process...');
		process.exit(1);
	}
});

/** ----- Application Initialization Complete ----- */
