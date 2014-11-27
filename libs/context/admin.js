/**
 * admin.js
 *
 * Admin context for handling
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
 * @date        August 25th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var clone = require('clone')
  , Device = require('./device')
  , enums = require('../../common/enums.js')
  , util = require('../util')('AdminContext');

/**
 * Variables in use
 */
var PrivilegeLevel = enums.PrivilegeLevel;

/**
 * Admin Constructor
 *
 * @param {string} args.client
 */
var Admin = function (args) {
	Device.call(this, args);
	this.$name = 'AdminContext'
}

/**
 * Inherit from Device
 */
util.inherits(Admin, Device);

/**
 * Getters/Setters
 */

/**
 * Level
 *
 * @param {number} level
 */
Admin.prototype.level = function () {
	return PrivilegeLevel.Admin;
}

module.exports = Admin;

