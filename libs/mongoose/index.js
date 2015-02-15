/**
 * index.js
 *
 * MongoDB connection handler
 *
 */

/**
 * Module dependencies
 */
var mongoose = require('mongoose')
  , async = require('async')
  , clone = require('clone')
  , extend = require('extend')
  , config = require('../../config')
  , util = require('../util')('mongoose')

/**
 * PARAMETERS
 */
var HEALTH_INTERVAL = 10000
  , HEALTH_TRIES = 10
  , CONNECTION_TIMEOUT = 60000;

/**
 * CONNECTION VARIABLES
 */
var isConnected = false;

/**
 * REGISTER DATABASES
 */
var databases = config.mongo.dbs;
databases.forEach(function (db) {
	mongoose[db.name] = mongoose.createConnection();
})

/**
 * REGISTER MODELS
 */
var models = require('../../models');

/**
 * CONNECTION LISTENERS
 */
var initListeners = function (callback) {
	var conn_number = 0;

	databases.forEach(function (db) {
		mongoose[db.name].on('error', function (err) {
			util.error(' + Mongo database ' + db.dbname + ' has thrown error: ', err);
		})
		mongoose[db.name].on('connected', function () {
			conn_number += 1;
			if (conn_number == databases.length) {
				isConnected = true;
			}
			if (mongoose[db.name].hosts) {
				mongoose[db.name].hosts.forEach(function (data) {
					util.log(' + Mongodb has connected to ' + db.dbname + ' database at: ', data);
				})
			} else {
				util.log(' + Mongodb has connected to ' + db.dbname + ' database at ' + mongoose[db.name].host + ' on port ' + mongoose[db.name].port);
			}
			if (process.env.NODE_ENV != 'test' || 
				process.env.NODE_ENV != 'development') {
				initHealthCheck(mongoose[db.name], db.dbname);
			}
		})
		mongoose[db.name].on('disconnected', function (err) {
		    util.error(' + Mongo database at ' + db.dbname + ' has disconnected...');
		})
	})
	callback(null)
}

/**
 * CONNECTION HEALTH CHECK
 */
var initHealthCheck = function (db, db_name) {
	var fails = 0;
	// Pick first registered model to use for health check;
	var model_name = Object.keys(db.models)[0];
	var Model = db.models[model_name];

	// Health check for database
	var timer2 = setInterval(function () {
		if (fails > HEALTH_TRIES) {
			util.error(' + Looks like something is wrong with the connection to ' + db_name + '.');
			mongoose._app.gracefulSuicide();
		}

		// Make sure request doesnt timeout
		var timer3 = setTimeout(function () {
			fails += 1;
			util.error(' + Health check ' + db_name + ' timed out...');
			return;
		}, 500);
		Model.findOne(function (err, data) {
			clearTimeout(timer3);
			if (err) {
				fails += 1;
				util.error(' + MongoDB returned err in simple check to ' + db_name + ' db: ' + err);

			} else {
				fails = 0;
			}
		})
	}, HEALTH_INTERVAL)
}

/**
 * CONNECTION HANDLERS
 */
var openConnections = function (callback) {
	async.each(databases, function (db, cb) {
		var opts = clone(config.mongo.options)

		var options = extend(true, opts, db.options || {});

		mongoose[db.name].openSet(uri(db.dbname, db.members), options);
		mongoose[db.name].once('connected', cb);
	}, callback)
}

mongoose.initializeConnections = function (callback) {
	var timer = setTimeout(function () {
		if (!isConnected) {
			util.error(' + MongoDB connection did not initialize in ' + CONNECTION_TIMEOUT + ' ms. Suiciding...')
			process.exit();
		}
	}, CONNECTION_TIMEOUT)

	async.series([
		initListeners,
		openConnections
	], function (err) {
		if (err) {
			util.error(' + Killing with error: ', err)
			process.exit(1)
		} else {
			callback(null)
		}
	})
}

mongoose.closeConnections = function (callback) {
	async.each(databases, function (db, cb) {
		mongoose[db.name].close(cb);
	}, callback)
}

mongoose.register = function (app) {
	this._app = app;
}

/**
 * Add appropriate models
 */

/** Guest Device Model **/
mongoose.addGuestModel = function (callback) {
	var Device = models.Device;

	util.log(' + Adding Guest device model to database...')
	async.series([
		// First look for guest
		function (cb) {
			Device.getByDeviceId(config.guest.deviceId, function (err, u) {
				if (err) return cb(err);
				else if (u) {
					// update and kick out
					u.set('apiKey', config.guest.apiKey)
						.save(callback);
				} else cb(null);
			})
		},

		// Add guest
		function (cb) {
			var guest = Device.make(config.guest.deviceId, config.guest.apiKey);

			guest.set('level', config.guest.level)
				.save(cb);
		}
	], callback);
}

/** Admin Device Model **/
mongoose.addAdminModel = function (callback) {
	var Device = models.Device;

	util.log(' + Adding Admin device model to database...')
	async.series([
		// First look for admin
		function (cb) {
			Device.getByDeviceId(config.admin.deviceId, function (err, u) {
				if (err) return cb(err);
				else if (u) {
					// update and kick out
					u.set('apiKey', config.admin.apiKey)
						.save(callback);
				} else cb(null);
			})
		},

		// Add admin
		function (cb) {
			var admin = Device.make(config.admin.deviceId, config.admin.apiKey);

			admin.set('level', config.admin.level)
				.save(cb);
		}
	], callback);
}

/**
 * Helper functions
 */
function uri (dbname, members) {
	if (!Array.isArray(members)) return;

	var protocol = 'mongodb://';

	var _uri = '';
	members.forEach(function (m, i) {
		_uri += protocol + m.host + ':' + m.port + '/' + dbname;

		if (i != members.length - 1) { _uri += ',' }
	})

	return _uri;
}

module.exports = mongoose;

















