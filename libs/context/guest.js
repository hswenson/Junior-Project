/**
 * guest.js
 *
 * Guest context
 */

/**
 * Module dependencies
 */
var clone = require('clone')
  , enums = require('../../common/enums.js')
  , util = require('../util')('Guest');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/**
 * Guest Constructor
 *
 * @param {string} args.user
 */
var Guest = function (device) {
	this.$name = 'GuestContext'

	this._device = null;
	this._ip = 'UNKNOWN';
	this.device(device);
}

/**
 * Getters/Setters
 */

/**
 * User model
 *
 * @param {User} [device]
 */
Guest.prototype.device = function (device) {
	if (device) {
		this._device = device;
		this._level = device.level;
	} else return this._device;
}

/**
 * Current ip address
 *
 * @param {string} [ip]
 */
Guest.prototype.ip = function (ip) {
	if (ip) this._ip = ip;
	else return this._ip;
}


/**
 * Level
 *
 * @param {number} level
 */
Guest.prototype.level = function () {
	return PrivilegeLevel.Guest;
}

Guest.prototype.isGuest = function () {
	return PrivilegeLevel.Guest == this.level();
}

Guest.prototype.isDevice = function () {
	return PrivilegeLevel.Device == this.level();
}

Guest.prototype.isAdmin = function () {
	return PrivilegeLevel.Admin == this.level();
}

/**
 * Model Utilities
 */

/**
 * Does final modification of the models
 *
 * The original object is changed.
 *
 * @param {object} obj Must be a JSON object and not a mongoose model
 */
Guest.prototype.finalModifiers = function (obj) {
	if (obj.toObject) throw new Error('Please provide a JSON object, not ' +
		'a mongoose object for ' + obj);

	// Remove any underbarred params
	for (var key in obj) {
		if (typeof key == 'string' && key[0] == '_' && key != '_id') {
			delete obj[key];
		}
	}

	// Convert created to uSec
	if (obj.created instanceof Date) {
		obj.uSec = Math.floor(obj.created.getTime() / 1000);
	}

	delete obj.created;

	return obj;
}

/**
 * Model Scrubbers
 */

/**
 * Export Base
 */
Guest.prototype.exportBase = function (mod) {
	var o;
	if (mod.toObject) o = mod.toObject();
	else o = mod;

	o = clone(o);
	this.finalModifiers(o);
	return o;
}

/**
 * Export Address
 */
Guest.prototype.exportStorage = function (mod) {
	var o;
	if (mod.toObject) o = mod.toObject();
	else o = mod;

	o = clone(o)

	delete o.payload;
	delete o.fields;

	this.finalModifiers(o);
	return o;
}

module.exports = Guest;
