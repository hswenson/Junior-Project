/**
 * device.js
 *
 * Device context for handling
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
 * @author      Nick Swenson (nick@swensonhe.com)
 * @date        July 7th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
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

