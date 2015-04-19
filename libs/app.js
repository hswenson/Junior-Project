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
  , defaultConfig = require('../config')
  , Api = require('./api')
  , routes = require('./routes')
  , models = require('../models')
  , request = require('request');

/**
 * Construct class
 *
 * @param {number} [config.app.port]
 */
var App = express();

var User = models.User;

/** Add properties for convenience **/
App.console = console;
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
		me.set('ports',  process.env.PORT ? [{ port: process.env.PORT }] : me.config().app.ports );
		me.use(express.compress());
	    me.use(express.methodOverride());
	    me.use(express.bodyParser({
	        uploadDir: path.join(__dirname, '../uploads'),
	        keepExtensions: true
	    }));
	    me.use(express.cookieParser());
		if (process.env.NODE_ENV != "local") {
		    me.use(function (req, res, next) {
		    	var validateUrl;
		    	var url = "https://fed.princeton.edu/cas/login?service=";
		    	var serviceUrl = 'www.princeton-rouge.com';
		    	url += serviceUrl;
		    	
		    	if (req.cookies.isPrincetonAuthorized) {
		    		res.cookie('isPrincetonAuthorized', req.cookies.isPrincetonAuthorized, { maxAge: 900000 });
		    		var email = req.cookies.isPrincetonAuthorized;
		    		User.getOrCreate(email, next);
		    	} else if (req.query.ticket) {
		    		validateUrl = "https://fed.princeton.edu/cas/validate";
					return request.get({uri: validateUrl, qs: {service: serviceUrl, ticket: req.query.ticket}}, function (err, butts, body) {
						if (err) return next(err);
						
						// Is valid
						if (typeof body == 'string' && body.indexOf('yes') > -1) {
							
							var username = body.split('\n')[1];
							var email = username + "@princeton.edu"

							res.cookie('isLoggedOut', "");
							res.cookie('isPrincetonAuthorized', email, { maxAge: 900000 });
							User.getOrCreate(email, next);
						} else {
							res.cookie('isLoggedOut', true);
							res.redirect("https://fed.princeton.edu/cas/logout?service=" + serviceUrl);
						}
					})
		    	} else if (!req.cookies.isLoggedOut) {
		    		res.cookie('isLoggedOut', true);
		    		res.redirect("https://fed.princeton.edu/cas/logout?service=" + serviceUrl);
		    	} else {
		    		res.redirect(url);
		    	}
		    });
		} else {
			me.use(function (req, res, next) {
				res.cookie('isPrincetonAuthorized', 'test@test.com');
				next();
			})
		}
	    me.use(express.errorHandler({
	        dumpExceptions: true,
	        showStack: true
	    }));
	    me.use('/i', express.static(path.join(__dirname, '../uploads')));
	    me.use('/', express.static(path.join(__dirname, '../static')));
	    me.use(me.router);
	    me.use(me.config().app.api.prefix, App.apiApp)
	});


	// start http servers
	me.get('ports').forEach(function (p) {
		me.servers.push(http.createServer(me).listen(p.port, function () {
		    console.log(' + jp server started via http ' +
		    	'protocol on port %d ', p.port);
		}))
	})

	// register routes
	console.log(' + Registering routes for application');
	routes.register(this);
}

/**
 * Shutdown servers gracefully
 */
App.stopServers = function (callback) {
	var me = this;
	if (!me.servers.length) {
		console.log('No servers are running')
		return callback(null);
	}

	console.log('All servers are gracefully shutting down...')
	async.each(me.servers, function (s, cb) {
		s.close(cb);
	}, function (err) {
		if (err) return callback(err);
		console.log('should be killing process')

		me.servers = [];
		callback(null);
	})
}

App.gracefulSuicide = function (callback) {
	this.stopServers(function (err) {
		console.log('Shutting down process...');
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
