/**
 * index.js
 *
 * Top level api for simplehuman
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
 * @date 		July 7th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var Api = require('../api')
  , enums = require('../../common/enums')
  , util = require('../util')('routes')
  , config = require('../../config')
  , Auth = require('../auth')
  , mqtt = require('../mqtt');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/** Constructor **/
var Routes = function () {
	this.$name = 'RouteLayer'
}

/**
 * Register routes with application
 */
Routes.prototype.register = function (app) {
	this.app = app;

	this.initRoutes();
}

/**
 * Initialize routes
 */
Routes.prototype.initRoutes = function () {
	if (!this.app) throw new Error('Application has not be registered with routes layer.');

	/** Health check routes **/
	this.registerRoute({
		fn: function (args, ret) { ret(null) },
		path: '/v',
		noApiPrefix: true,
		skipAuth: true
	})

	// Redirect to docs
	this.registerRoute({
		fn: function (args, ret, req, res) {
			return res.redirect('/docs');
		},
		path: '/',
		noApiPrefix: true,
		skipAuth: true
	})

	/** Guest Routes **/
	this.registerRoute({
		fn: Api.device.register,
		path: '/device/register',
		skipAuth: true
	})
}

/**
 * Register routes with both GET and POST
 *
 * 1. Registers route, 2. Passes to Auth middleware, 3. Passes to field
 * mappers, 4. Passes to function
 *
 * @param {function} route.fn
 * @param {string} route.path
 * @param {boolean} route.noApiPrefix
 * @param {PrivilegeLevel} [route.privilegeLevel=PrivilegeLevel.Guest]
 */
Routes.prototype.registerRoute = function (route) {
	var me = this;
	if (typeof route.fn != 'function' ||
		typeof route.path != 'string') throw new Error('Route must contain a function and path');

	if (!route.noApiPrefix) route.path = config.app.api.prefix + route.path;
	if (!route.methods) route.methods = [ 'GET', 'POST' ];

	var skipAuth = !!route.skipAuth;
	var skipWrap = !!route.skipWrap;

	// Default to Guest
	route.privilegeLevel = route.privilegeLevel == null ?
		PrivilegeLevel.Guest :
		route.privilegeLevel;

	var authMiddleware = !skipAuth ?
							Auth.middleware(route.privilegeLevel) :
							Auth.middleware(false);

	var wrappedFunction;
	if (skipWrap) {
		wrappedFunction = route.fn;
	} else {
		wrappedFunction = this.wrapper(route.fn);
	}

	// Register
	route.methods.forEach(function (m) {
		me.app[m.toLowerCase()](route.path, authMiddleware, wrappedFunction);
	})
}

/**
 * Wraps API fn
 *
 * Wraps fn to make API req/res and GET/POST independent
 *
 * @param {function} fn
 */
Routes.prototype.wrapper = function (fn) {
	var me = this;
	if (typeof fn != 'function') throw new Error('Please supply a function for the endpoint');

	return function (req, res, next) {
		if (!req.Context) throw new Error('Must supply a Context attached to the request to run function inside of');
		var args = me._queryConverter(req);
		var Context = req.Context;

		/** Attach the req, res to end of arguments */
		var start = Date.now();
		fn.call(Context, args, function (err, result) {
			var time = Date.now() - start;
			util.debug(req.protocol.toUpperCase() + ':', req.path, time + 'ms')

			if (err && err.code) {
				util.error(err.stack);
				res.json(err.status || 500, { result: err.code });
			} else if (err) {
				err = new Error.Internal(err.message || err);
				util.error(err.stack);
				res.json(err.status || 500, { result: err.code });
			} else {
				res.json(result)
			}
		}, req, res);
	}
}

/**
 * Converts the query string and body to a single object
 */
Routes.prototype._queryConverter = function (req) {
	var args = {};
	var key;
	for (key in req.files) {
		args[key] = req.files[key];
	}
	for (key in req.query) {
		args[key] = req.query[key];
	}

	for (key in req.params) {
		args[key] = req.params[key];
	}
	for (key in req.body) {
		args[key] = req.body[key]
	}

	return args;
}

module.exports = new Routes();





















