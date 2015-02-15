	/**
 * index.js
 *
 * Top level api
 *
 */

/**
 * Module dependencies
 */
var routes = require('../routes')
  , Context = require('../context')
  , enums = require('../../common/enums.js')
  , config = require('../../config')
  , async = require('async')
  , models = require('../../models');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel
  , Device = models.Device;

/**
 * Class Constructor
 */
var Auth = function () {
	this.$name = "AuthenticationLayer";
}

/**
 * Auth Middleware
 *
 * If Auth is accessed through middleware, parses necessary details from req
 * and binds context to request at req.Context
 *
 * @param {PrivilegeLevel} privilegeLevel
 */
Auth.prototype.middleware = function (privilegeLevel) {
	var me = this;

	var skipAuth = privilegeLevel === false ? true : false;

	return function (req, res, next) {
		var apiDeviceId = req.header('apiDeviceId') || req.param('apiDeviceId');
		var apiKey = req.header('apiKey') || req.param('apiKey');

		var ip = req.connection.remoteAddress;

		me.validate({ apiDeviceId: apiDeviceId,
					  apiKey: apiKey,
					  privilegeLevel: privilegeLevel,
					  skipAuth: skipAuth,
					  ip: ip },
			function (err, Context) {
		  		if (err && err.code) {
		  			util.error(err.stack)
		  			res.json(err.status || 500, { status: err.code })
		  		} else if (err) {
		  			util.error(err.stack);
		  			err = new Error.Internal(err);
		  			res.json(500, { status: err.code })
		  		} else {
		  			req.Context = Context;
		  			next(null);
		  		}
		  	});
	}
}

/**
 * Validate
 *
 * @param {PrivilegeLevel} args.privilegeLevel
 * @param {string} args.apiDeviceId
 * @param {string} args.apiKey
 * @param {string} args.ip
 * @param {string} args.apiKey
 * @param {function} callback
 */
Auth.prototype.validate = function (args, callback) {
	var CurrentContext, device;
	var skipAuth = !!args.skipAuth;

	var apiKey = skipAuth ? config.guest.apiKey :
					args.apiKey || config.guest.apiKey;
	var apiDeviceId = skipAuth ? config.guest.deviceId :
					args.apiDeviceId || config.guest.deviceId;

	if (!skipAuth && typeof args.privilegeLevel != 'number')
		return callback(new Error.Internal('Please supply a privilegeLevel number to ' +
			'authorize against'));

	async.series([
		// Get device object and check authorization for route
		function (cb) {
			Device.getByDeviceId(apiDeviceId, function (err, d) {
				if (err) {
					cb(new Error.Internal(err))
				} else if (!d || !d.checkApiKey(apiKey)) {
					cb(new Error.InvalidLogin())
				} else if (!skipAuth && d.get('level') < args.privilegeLevel)  {
					cb(new Error.NotAuthorized())
				} else {
					device = d;
					cb(null);
				}
			})
		},

		// Create context object
		function (cb) {
			switch (device.get('level')) {
				case PrivilegeLevel.Guest:
					CurrentContext =
						new Context.Guest(device);
					break;

				case PrivilegeLevel.Device:
					CurrentContext =
						new Context.Device(device);
					break;

				case PrivilegeLevel.Admin:
					CurrentContext =
						new Context.Admin(device);
					break;

			}

			CurrentContext.ip(args.ip);
			cb(null);
		}
	], function (err) {
		if (err) callback(err);
		else callback(null, CurrentContext);
	})
}

module.exports = new Auth();
