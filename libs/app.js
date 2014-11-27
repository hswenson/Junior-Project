/**
 * App.js
 *
 * Frontend handler
 */

/**
 * Module dependencies
 */
var async = require('async')
  , path = require('path')
  , express = require('express')
  , extend = require('extend')
  , path = require('path')
  , http = require('http')
  , https = require('https')
  , routes = require('./routes')
  , util = require('./util.js')('app')
  , defaultConfig = require('../config')
  , Api = require('./api')
  , routes = require('./routes');

/**
 * Construct class
 *
 * @param {number} [config.app.port]
 */
var App = express();

/** Add properties for convenience **/
App.util = util;
App.Api = Api;
App.servers = [];
App.apiApp = express();

/**
 * Get configs
 *
 * @param {number} [config.app.port]
 */
App.config = function (config) {
	this._config = extend(true, config, this._config, defaultConfig);

	return this._config || {};
}

/**
 * Initialize servers
 *
 * @oaram {number} [config.app.port]
 */
App.startServers = function (config) {
	var me = this;
	this.config(config);

	this.configure(function () {
		me.set('ports', me.config().app.ports || [{ port: 8000 }] );
		me.use(express.compress());
	    me.use(express.methodOverride());
	    me.use(express.bodyParser({
	        uploadDir: path.join(__dirname, '../tmp/uploads'),
	        keepExtensions: true
	    }));
	    me.use(express.cookieParser());
	    me.use(express.errorHandler({
	        dumpExceptions: true,
	        showStack: true
	    }));
	    me.use(me.router);
	    me.use(me.config().app.api.prefix, App.apiApp)
	});


	// start http servers
	me.get('ports').forEach(function (p) {
		if (p.secure) {
			me.servers.push(https.createServer(me).listen(p.port, function () {
			    util.log('+ simplehuman iot started via https ' +
			    	'protocol on port %d ', p.port);
			}))
		} else {
			me.servers.push(http.createServer(me).listen(p.port, function () {
			    util.log(' + simplehuman iot started via http ' +
			    	'protocol on port %d ', p.port);
			}))
		}
	})

	// register routes
	util.log(' + Registering routes for application');
	routes.register(this);
}

/**
 * Shutdown servers gracefully
 */
App.stopServers = function (callback) {
	var me = this;
	if (!me.servers.length) {
		util.log('No servers are running')
		return callback(null);
	}

	util.log('All servers are gracefully shutting down...')
	async.each(me.servers, function (s, cb) {
		s.close(cb);
	}, function (err) {
		if (err) return callback(err);
		util.log('should be killing process')

		me.servers = [];
		callback(null);
	})
}

App.gracefulSuicide = function (callback) {
	this.stopServers(function (err) {
		util.log('Shutting down process...');
		process.exit(1);
	})
}

/**
 * ENVIRONMENT
 */
App.isTest = function () {
	return process.env.NODE_ENV == 'test';
}
App.isDevelopment = function () {
	return process.env.NODE_ENV == 'development';
}


module.exports = App;
