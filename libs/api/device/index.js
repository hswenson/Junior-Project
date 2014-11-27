/**
 * device.js
 *
 * Device class for simplehuman api
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
 * @date 		September 2nd, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var async = require('async')
  , util = require('../../util')('api/device')
  , config = require('../../../config')
  , extend = require('extend')
  , clone = require('clone')
  , models = require('../../../models');


/**
 * Models in use
 */
var Device = models.Device;

/**
 * Device API
 */
var DeviceAPI = function () {
	this.$name = 'DeviceApi'
};

/**
 * Register a device
 *
 * @param {string} args.deviceId
 * @param {string} args.apiKey
 */
DeviceAPI.prototype.register = function (args, ret) {
}

// Device api singleton
module.exports = new DeviceAPI();
