/**
 * device.js
 *
 * Device context for handling
 */

/**
 * Module dependencies
 */
var clone = require('clone')
  , Guest = require('./guest')
  , enums = require('../../common/enums.js')
  , util = require('../util')('DeviceContext');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/**
 * Device Constructor
 *
 * @param {string} args.client
 */
var Device = function (args) {
	Guest.call(this, args);
	this.$name = 'DeviceContext'
}

/**
 * Inherit from Guest
 */
util.inherits(Device, Guest);

/**
 * Getters/Setters
 */

/**
 * Level
 *
 * @param {number} level
 */
Device.prototype.level = function () {
	return PrivilegeLevel.Device;
}

module.exports = Device;

