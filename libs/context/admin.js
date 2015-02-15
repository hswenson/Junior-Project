/**
 * admin.js
 *
 * Admin context for handling
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

