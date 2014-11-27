/**
 * initialize.js
 *
 * Tests the simpleExpress magento module through the endpoint
 *
 *
 * NOTICE OF OWNERSHIP
 *
 * Written permission must be received from Simplehuman, LLC before any
 * modules, code or functionality contained within are copied, imitated or
 * reproduced in any way. This code was designed and prepared exclusively for
 * Simplehuman, LLC by Swenson He, LLC. Please contact the script author or
 * nick@swensonhe.com with questions.
 *
 * @author 		Nick Swenson (nick@swensonhe.com)
 * @date 		July 14th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */


/**
 * Module dependencies
 */

require('coffee-script/register');

var fs = require('graceful-fs')
	, util = require('./util.js')('initialize')
  , express = require('express')
  , http = require('http')
  , https = require('https')
  , async = require('async')
  , config = require('../config')
  , MqttClient = require('./mqtt')
  , posix = require('posix');


/**
 * APPLICATION INITIALIZATION
 */
function Initialize () {
	/* jshint ignore:start */
	this._app;
	this._models;
	this._mongoose;
	/* jshint ignore:end */
}

Initialize.prototype.initApp = function (callback) {
	var me = this;
	// Print logo
	async.series([
		function (cb) {
			util.log('<-------------------- INITIALIZING ' + process.env.NODE_ENV.toUpperCase() + ' APPLICATION ------------>')
			cb(null);
		},

		/** Connect MongoDB **/
		function (cb) {
			util.log('Initializing connection to Mongodb...')
			me._mongoose = require('./mongoose');
			me._mongoose.initializeConnections(cb);
		},

		/** Initialize App and start server */
		function (cb) {
			util.log('Initializing application and session handling...');
			me._app = require('./app.js');
			util.log(' + Application initialized successfully!');
			cb(null);
		},

		/** Register application with mongoose */
		function (cb) {
			util.log('Registering application with mongoose...');
			me._mongoose.register(me._app);
			util.log(' + Application registered successfully!');
			cb(null);
		},

		/** Finish */
		function (cb) {
			util.log('<--------------- APPLICATION SUCCESSFULLY INITIALIZED ------------>')
			util.log();
			cb(null);
		}
	], callback)
}


Initialize.prototype.initServer = function (callback) {
	var app = this._app;
	var me = this;

	async.series([
		/** Initialize and register routes, dashboard, documentation and swagger */
		function (callback) {
			util.log('<-------------------- STARTING ' + process.env.NODE_ENV.toUpperCase() + ' SERVERS ------------>')

			// Ensure can open enough file descriptors
			var ulimit = posix.getrlimit('nofile');
			var FDSOPEN = 50000;
			util.log('Trying to set the hard and soft ulimit to ' + FDSOPEN + '...')
			var threwError;
			if (ulimit.hard && ulimit.hard < FDSOPEN) {
				threwError = false;
				try {
					posix.setrlimit('nofile', { hard: FDSOPEN })
				} catch (err) {
					threwError = true;
					FDSOPEN = ulimit.hard;

					util.log('Trying to set hard limit: ', err);
					util.log('ERROR!: could not increase the hard system file descriptor limit to ' + FDSOPEN + '! Currently at: ' + ulimit.hard);
				}
				if (!threwError) {
					util.log(' + Hard limit set to ' + FDSOPEN + ' successfully!')
				}
			} else {
				util.log(' + Hard limit already set to ' + (ulimit.hard || 'infinity'));
			}
			if (ulimit.soft && ulimit.soft < FDSOPEN) {
				threwError = false;
				try {
					posix.setrlimit('nofile', { soft: FDSOPEN - 1 })
				} catch (err) {
					threwError = true;
					util.log('Trying to set soft limit: ', err);
					util.log('ERROR!: could not increase the soft system file descriptor limit to ' + FDSOPEN + '! Currently at: ' + ulimit.soft);
				}
				if (!threwError) {
					util.log(' + Soft limit set to ' + (FDSOPEN - 1) + ' successfully!')
				}
			} else {
				util.log(' + Soft limit already set to ' + ulimit.soft || 'infinity')
			}

			// Kill if no app loaded
			if (!app) {
				throw new Error('Must initialize app before starting server!');
			}
			util.log('Registering routes with application...')
			app.startServers();
			util.log(' + Routes successfully registered!')
			util.log('Initialize documentation and swagger server for api docs...')
			/** Initialize Swagger */
			var swaggerApp = require('../documentation/libs')(app);
			var documentationApp = require('../documentation/app')(app);
			util.log(' + Documentation and swagger successfully initialized!')
			callback(null);
		},

		/** Finish */
		function (cb) {
			util.log('<--------------- SIMPLEHUMAN SERVERS SUCCESSFULLY STARTED ------------>')
			cb(null);
		}
	], callback)
}

Initialize.prototype.closeServers = function (callback) {
	var app = this._app;

	util.log('All servers are gracefully shutting down...')
	app.stopServers(callback);
}

Initialize.prototype.injectData = function (callback) {
	var me = this;
	var models = this._models = require('../models');
	var app = this._app;

	util.log('<--------------- INJECTING NECESSARY DATABASE MODELS --------------->');
	async.series([
		// Add guest model
		function (callback) { me._mongoose.addGuestModel(callback) },
		// Add Admin model
		function (callback) { me._mongoose.addAdminModel(callback) }
	], function (err) {
		if (err) {
			console.error('Error while injecting data: ', err.stack);
			callback(err)
		} else {
			util.log('<--------------- SUCCESSFULLY INJECTED MODELS INTO DB --------------->')
			util.log()
			callback(null);
		}
	})
}

/**
 * handle process errors
 */
process.on('uncaughtException', function(err) {
    console.error(err.stack);
	process.exit(1);
});

exports = module.exports = new Initialize();

exports.Initialize = Initialize;
