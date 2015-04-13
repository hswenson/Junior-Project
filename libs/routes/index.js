/**
 * index.js: Top level api
 */

/**
 * Module dependencies
 */
var Api = require('../api')
  , enums = require('../../common/enums')
  , config = require('../../config');

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

    this.registerRoute({
        fn: function (args, ret, req, res) {
                res.send('<form method="post" enctype="multipart/form-data">'
                    + '<p>size (required): <input type="text" name="size" /></p>'
                    + '<p>color (optional): <input type="text" name="color" /></p>'
                    + '<p>shape (required): <input type="text" name="shape" /></p>'
                    + '<p>length (required): <input type="text" name="length" /></p>'
                    + '<p>email (required): <input type="text" name="email" /></p>'
                    + '<p>name (required): <input type="text" name="name" /></p>'
                    + '<p>dorm (required): <input type="text" name="dorm" /></p>'
                    + '<p>phone (required): <input type="text" name="phone" /></p>'
                    + '<p>description (required): <input type="text" name="description" /></p>'
                    + '<p>brand (required): <input type="text" name="brand" /></p>'
                    + '<p>file: <input type="file" name="file" /></p>'
                    + '<p><input type="submit" value="Upload" /></p>'
                    + '</form>');
        },
        path: '/dress/upload',
		skipAuth: true,
        methods: [ 'GET' ]
    })

	// Redirect to docs
	this.registerRoute({
		fn: Api.dress.upload,
		path: '/dress/upload',
		methods: [ 'POST' ],
		skipAuth: true
	})

	this.registerRoute({
		fn: Api.dress.delete,
		path: '/dress/delete',
		methods: [ 'POST' ],
		skipAuth: true
	})

	// Redirect to docs
	this.registerRoute({
		fn: Api.user.get,
		path: '/user/get',
		methods: [ 'GET' ],
		skipAuth: true
	})

	/** Guest Routes **/
	this.registerRoute({
		fn: Api.dress.filter,
		path: '/dress/filter',
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
							function (req, res, next) { next(null) };

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
		if (!req.Context) req.Context = fn;
		var args = me._queryConverter(req);
		var Context = req.Context;

		/** Attach the req, res to end of arguments */
		var start = Date.now();
		fn.call(Context, args, function (err, result) {
			var time = Date.now() - start;
			console.debug(req.protocol.toUpperCase() + ' ' + req.method + ':', req.path, time + 'ms')

			if (err && err.code) {
				console.error(err.stack);
				res.json(err.status || 500, { result: err.code });
			} else if (err) {
				err = new Error.Internal(err.message || err);
				console.error(err.stack);
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
	args["contentType"] = req.get('content-type')

	if (req.cookies.isPrincetonAuthorized) {
		args['cookieEmail'] = req.cookies.isPrincetonAuthorized;
 	}
	return args;
}

module.exports = new Routes();





















