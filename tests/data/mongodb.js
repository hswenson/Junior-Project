/**
 * mongodb.js
 *
 * Sample data and methods for mongodb
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
 * @date 		July 22nd, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

 /**
 * Module dependencies
 */
var util = require('../../libs/util')('mongodbData')
  , async = require('async')
  , clone = require('clone')
  , models = require('../../models')
  , DATA = require('./data.js')
  , Context = require('../../libs/context')
  , mongoose = require('mongoose')

/**
 * Models in use
 */
var Device = models.Device
  , Storage = models.Storage;

/**
 * Initializer
 */
var MongoDBData = function () {
	this.statics = {
		users: DATA.testUsers,
		storagesDevice1: DATA.testStoragesDevice1,
		storagesDevice2: DATA.testStoragesDevice2
	}

	this.userContext = null;
	this.guestContext = null;
}

MongoDBData.prototype.createTestStoragesDevice1 = function (callback) {
	var me = this;
	var statics = this.statics;
	var i = 0;

	async.eachLimit(statics.storagesDevice1, 1, function (s, cb) {
		var storage = Storage.make(s.deviceId, s.ip, s.payload, s.userId);

		statics.storagesDevice1[i] = storage;
		i++;
		storage.save(cb);
	}, function (err) {
		if (err) callback(err);
		else {
			callback(null);
		}
	})
};

MongoDBData.prototype.createTestStoragesDevice2 = function (callback) {
	var me = this;
	var statics = this.statics;
	var i = 0;

	async.eachLimit(statics.storagesDevice2, 1, function (s, cb) {
		var storage = Storage.make(s.deviceId, s.ip, s.payload, s.userId);

		statics.storagesDevice2[i] = storage;
		i++;
		storage.save(cb);
	}, function (err) {
		if (err) callback(err);
		else {
			callback(null);
		}
	})
};

MongoDBData.prototype.removeAll = function (callback) {
	var Models = Object.keys(models);
	async.each(Models, function (db, cb) {
		if (models[db].remove)
			models[db].remove(cb);
		else cb(null);
	}, callback)
}

MongoDBData.prototype.loadGuestContext = function (callback) {
	var me = this;

	mongoose.addGuestModel(function (err, guest) {
		me.guestContext = new Context.Guest(guest[1][0]);
		callback(null)
	})
}

MongoDBData.prototype.removeDevices = function (callback) {
	Device.remove(callback);
}

MongoDBData.prototype.removeStorages = function (callback) {
	Storage.remove(callback);
}

module.exports = new MongoDBData();
