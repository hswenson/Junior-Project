/**
 * index.js
 *
 * Top level api for simplehuman
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
 * @author 		Royal Morris (royal@swensonhe.com)
 * @date 		July 7th, 2014
 *
 * @copyright   Copyright (c) 2014 Simplehuman, LLC (http://www.simplehuman.com)
 */

/**
 * Module dependencies
 */
var DeviceAPI = require('./device');

/**
 * Initialize API
 */
var Api = function () {
	this.$name = 'TopLevelAPI';
}

/**
 * Device functions
 */
Api.prototype.device = DeviceAPI;

module.exports = new Api();

