/**
 * initialize.js
 *
 */


/**
 * Module dependencies
 */
var express = require('express')
  , http = require('http')
  , async = require('async')
  , config = require('../config');


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
			console.log('<-------------------- INITIALIZING ' + process.env.NODE_ENV.toUpperCase() + ' APPLICATION ------------>')
			cb(null);
		},

		/** Connect MongoDB **/
		function (cb) {
			console.log('Initializing connection to Mongodb...')
			me._mongoose = require('./mongoose');
			me._mongoose.initializeConnections(cb);
		},

		/** Initialize App and start server */
		function (cb) {
			console.log('Initializing application and session handling...');
			me._app = require('./app.js');
			console.log(' + Application initialized successfully!');
			cb(null);
		},

		/** Register application with mongoose */
		function (cb) {
			console.log('Registering application with mongoose...');
			me._mongoose.register(me._app);
			console.log(' + Application registered successfully!');
			cb(null);
		},

		/** Finish */
		function (cb) {
			console.log('<--------------- APPLICATION SUCCESSFULLY INITIALIZED ------------>')
			console.log();
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
			console.log('<-------------------- STARTING ' + process.env.NODE_ENV.toUpperCase() + ' SERVERS ------------>')

			// Kill if no app loaded
			if (!app) {
				throw new Error('Must initialize app before starting server!');
			}
			console.log('Registering routes with application...')
			app.startServers();
			console.log(' + Routes successfully registered!')
			console.log('Initialize documentation and swagger server for api docs...')
			/** Initialize Swagger */
			var swaggerApp = require('../documentation/libs')(app);
			var documentationApp = require('../documentation/app')(app);
			console.log(' + Documentation and swagger successfully initialized!')
			callback(null);
		},

		/** Finish */
		function (cb) {
			console.log('<--------------- SERVERS SUCCESSFULLY STARTED ------------>')
			cb(null);
		}
	], callback)
}

Initialize.prototype.closeServers = function (callback) {
	var app = this._app;

	console.log('All servers are gracefully shutting down...')
	app.stopServers(callback);
}

exports = module.exports = new Initialize();

exports.Initialize = Initialize;
